import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {SocialLoginButton} from '@features/auth/social-login-button';
import {login} from '@react-native-seoul/kakao-login';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {useKakaoSignin, useAppleSignin} from '@features/auth/api';
import {secureStorage} from '@/shared/lib/security';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';
import {jwtDecode} from 'jwt-decode';
import {fcmService} from '@/shared/lib/firebase';

// 전체 내비게이션 타입 정의
type RootStackParamList = {
  Auth: {
    screen: string;
    params?: Record<string, any>;
  };
  Main: {
    screen?: string;
    params?: Record<string, any>;
  };
};

export const SocialLoginSection = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const kakaoSignin = useKakaoSignin();
  const appleSignin = useAppleSignin();
  const {t} = useTranslation();

  // FCM 토큰을 안전하게 가져오는 함수
  const getFcmTokenSafely = async (): Promise<string | undefined> => {
    try {
      const token = await fcmService.getToken();
      console.log('FCM 토큰 획득 성공:', token);
      return token || undefined;
    } catch (error) {
      console.warn('FCM 토큰 획득 실패:', error);
      return undefined;
    }
  };

  // 소셜 로그인 핸들러
  const handleSocialLogin = async (provider: string) => {
    console.log(`${provider} 로그인 시도`);

    if (provider === 'Kakao') {
      try {
        console.log('카카오 로그인 시작');
        const tokenInfo = await login();
        console.log('카카오 토큰 획득:', tokenInfo.accessToken);
        console.log('카카오 토큰 획득:', tokenInfo);
        // 카카오 OAuth ID 가져오기
        let oauthId = '';
        if (tokenInfo.idToken) {
          const decoded = jwtDecode<{sub: string}>(tokenInfo.idToken);
          oauthId = decoded.sub;
          console.log('카카오 OAuth ID =', oauthId); // 회원번호(고유식별자) 출력
        }

        // FCM 토큰 가져오기 (실패해도 계속 진행)
        const fcmToken = await getFcmTokenSafely();

        // 카카오 토큰으로 서버에 로그인 시도
        Toast.show({
          type: 'info',
          text1: t('auth.kakaoLoginProcessing'),
          position: 'bottom',
        });

        try {
          const response = await kakaoSignin.mutateAsync({
            kakaoToken: tokenInfo.accessToken,
            fcmToken,
          });

          if (response.success) {
            // 응답 확인
            console.log('카카오 로그인 응답:', response.data);

            // accessToken 저장
            if (response.data && response.data.accessToken) {
              await secureStorage.saveToken(response.data.accessToken);

              Toast.show({
                type: 'success',
                text1: t('auth.loginSuccess'),
                position: 'bottom',
              });

              // 메인 화면으로 이동
              navigation.navigate('Main', {});
            } else {
              console.error('토큰이 응답에 없습니다:', response);
              throw new Error(t('auth.noTokenError'));
            }
          } else {
            throw new Error(response.message || t('auth.loginFailed'));
          }
        } catch (apiError) {
          if (apiError == 'Error: 존재하지 않는 사용자입니다') {
            // OAuth ID가 없으면 에러 처리
            if (!oauthId) {
              Toast.show({
                type: 'error',
                text1: t('auth.kakaoNoIdError'),
                position: 'bottom',
              });
              return;
            }

            // 회원가입 화면으로 이동하면서 카카오 OAuth ID 전달
            Toast.show({
              type: 'info',
              text1: t('auth.newUserRegistration'),
              position: 'bottom',
            });

            navigation.navigate('Auth', {
              screen: 'SignUp',
              params: {
                kakaoOAuthId: oauthId,
                fcmToken: fcmToken,
              },
            });
          } else {
            // 그 외 API 에러는 재던지기
            throw apiError;
          }
        }
      } catch (error) {
        console.error('카카오 로그인 에러:', error);
        Toast.show({
          type: 'error',
          text1: t('auth.loginError'),
          text2: (error as Error).message,
          position: 'bottom',
        });
      }
    } else if (provider === 'Google') {
      navigation.navigate('Auth', {
        screen: 'SignUp',
      });
    } else if (provider === 'Apple') {
      try {
        // iOS Apple 로그인 처리
        if (Platform.OS === 'ios') {
          // 애플 로그인 요청 (새로운 인증 요청)
          const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
          });

          // 인증 상태 확인
          const {identityToken, authorizationCode, fullName, email} =
            appleAuthRequestResponse;

          // FCM 토큰 가져오기 (실패해도 계속 진행)
          const fcmToken = await getFcmTokenSafely();

          // 로깅
          console.log('Apple 로그인 정보: ', {
            identityToken,
            authorizationCode,
            fullName,
            email,
            fcmToken,
          });

          if (!identityToken) {
            throw new Error(t('auth.appleNoTokenError'));
          }

          if (!fcmToken) {
            throw new Error('FCM 토큰을 가져올 수 없습니다.');
          }

          // 토스트 메시지
          Toast.show({
            type: 'info',
            text1: t('auth.appleLoginProcessing'),
            position: 'bottom',
          });

          try {
            // 애플 identityToken으로 서버에 로그인 시도
            const response = await appleSignin.mutateAsync({
              idToken: identityToken,
              fcmToken,
            });

            if (response.success) {
              // 응답 확인
              console.log('애플 로그인 응답:', response.data);

              // accessToken 저장
              if (response.data && response.data.accessToken) {
                await secureStorage.saveToken(response.data.accessToken);

                Toast.show({
                  type: 'success',
                  text1: t('auth.loginSuccess'),
                  position: 'bottom',
                });

                // 메인 화면으로 이동
                navigation.navigate('Main', {});
              } else {
                console.error('토큰이 응답에 없습니다:', response);
                throw new Error(t('auth.noTokenError'));
              }
            } else {
              throw new Error(response.message || t('auth.loginFailed'));
            }
          } catch (apiError) {
            if (apiError == 'Error: 존재하지 않는 사용자입니다') {
              // 기존 애플 인증 정보로 회원가입으로 이동
              Toast.show({
                type: 'info',
                text1: t('auth.newUserRegistration'),
                position: 'bottom',
              });

              // 애플은 fullName이 { familyName, givenName, middleName, namePrefix, nameSuffix } 구조
              const userName = fullName
                ? `${fullName.givenName || ''} ${
                    fullName.familyName || ''
                  }`.trim()
                : '';

              navigation.navigate('Auth', {
                screen: 'SignUp',
                params: {
                  // 기존 identityToken 재사용
                  idToken: identityToken,
                  email: email,
                  userName,
                  fcmToken,
                  isAppleSignUp: true,
                },
              });
            } else {
              // 그 외 API 에러는 재던지기
              throw apiError;
            }
          }
        }
      } catch (error) {
        console.error('Apple 로그인 실패: ', error);
        Toast.show({
          type: 'error',
          text1: t('auth.loginError'),
          text2: (error as Error).message,
          position: 'bottom',
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <SocialLoginButton
        type="kakao"
        onPress={() => handleSocialLogin('Kakao')}
      />

      {/* <SocialLoginButton
        type="google"
        onPress={() => handleSocialLogin('Google')}
      /> */}

      {Platform.OS === 'ios' && (
        <SocialLoginButton
          type="apple"
          onPress={() => handleSocialLogin('Apple')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
});
