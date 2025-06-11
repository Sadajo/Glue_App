import React, {useEffect, useState, useCallback} from 'react';
import {AppProvider} from './providers';
import {AppNavigator} from './providers/navigation';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import * as RootNavigation from './navigation/RootNavigation';
import {useTheme} from './providers/theme';
import {AppToast} from '@/shared/ui/Toast';
import {fcmService} from '@/shared/lib/firebase';
import {localNotificationService} from '@/shared/lib/notifications/localNotification';
import {logger} from '@/shared/lib/logger';
import {secureStorage} from '@/shared/lib/security';
import {jwtDecode} from 'jwt-decode';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {theme} = useTheme();

  // JWT 토큰 만료 확인 함수
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<{exp: number}>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      logger.error('JWT 토큰 디코딩 실패:', error);
      return true;
    }
  };

  // 자동 로그인 검증 함수
  const checkAutoLogin = useCallback(async (): Promise<boolean> => {
    try {
      logger.info('자동 로그인 검증 시작');

      // 저장된 토큰 가져오기
      const token = await secureStorage.getToken();

      if (!token) {
        logger.info('저장된 토큰 없음 - 로그인 필요');
        return false;
      }

      // 토큰 만료 확인
      if (isTokenExpired(token)) {
        logger.info('토큰 만료됨 - 토큰 삭제 및 재로그인 필요');
        await secureStorage.removeToken();
        return false;
      }

      logger.info('자동 로그인 성공 - 유효한 토큰 확인됨');
      return true;
    } catch (error) {
      logger.error('자동 로그인 검증 중 오류:', error);
      // 오류 발생 시 안전을 위해 토큰 삭제
      await secureStorage.removeToken();
      return false;
    }
  }, []);

  useEffect(() => {
    // 앱 초기화 로직
    const initializeApp = async () => {
      try {
        // 로컬 알림 서비스 초기화
        localNotificationService.init();

        // FCM 초기화 및 권한 요청
        await fcmService.requestPermission();

        // iOS의 경우 디바이스 등록 (Android는 내부적으로 무시됨)
        await fcmService.registerDevice();

        // FCM 토큰 가져오기 (백그라운드에서 진행하여 앱 로딩 속도에 영향 없도록)
        fcmService
          .getToken()
          .then(token => {
            if (token) {
              logger.info('FCM 토큰 초기화 완료');
            } else {
              logger.warn('FCM 토큰을 얻지 못했습니다');
            }
          })
          .catch(error => {
            logger.error('FCM 토큰 초기화 오류:', error);
          });

        // 자동 로그인 처리
        const autoLoginResult = await checkAutoLogin();
        setIsLoggedIn(autoLoginResult);
      } catch (error) {
        logger.error('앱 초기화 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    // FCM 토큰 갱신 리스너 설정
    const unsubscribeTokenRefresh = fcmService.registerTokenRefreshListener(
      newToken => {
        logger.info('FCM 토큰이 갱신되었습니다:', newToken);
        // 여기서 필요한 경우 서버에 새 토큰을 전송할 수 있습니다
      },
    );

    // FCM Foreground 메시지 리스너 설정
    const unsubscribeForegroundMessage =
      fcmService.registerForegroundMessageListener(message => {
        logger.info('Foreground 메시지 수신:', message);
        // 로컬 알림 표시
        localNotificationService.showFCMNotification(message);
      });

    // FCM Background 메시지 리스너 설정
    fcmService.registerBackgroundMessageListener(async message => {
      logger.info('Background 메시지 수신:', message);
      // 백그라운드에서는 시스템 알림이 자동으로 표시되므로 추가 처리 불필요
      // 필요시 데이터 저장이나 배지 카운트 업데이트 등 수행 가능
    });

    // FCM 알림 탭 리스너 설정
    const unsubscribeNotificationOpened =
      fcmService.registerNotificationOpenedListener(message => {
        logger.info('알림 탭으로 앱 실행:', message);
        // 알림 데이터를 기반으로 적절한 화면으로 네비게이션
        if (message.data) {
          RootNavigation.navigateFromNotification(message.data);
        }
      });

    // 앱이 종료된 상태에서 알림으로 실행된 경우 확인
    fcmService.getInitialNotification().then(message => {
      if (message) {
        logger.info('앱 종료 상태에서 알림으로 실행:', message);
        // 알림 데이터를 기반으로 적절한 화면으로 네비게이션
        if (message.data) {
          // 네비게이션이 준비될 때까지 약간의 지연 추가
          setTimeout(() => {
            RootNavigation.navigateFromNotification(message.data);
          }, 1000);
        }
      }
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForegroundMessage();
      unsubscribeNotificationOpened();
    };
  }, [checkAutoLogin]);

  useEffect(() => {
    // 인증 상태에 따른 초기 네비게이션 설정
    if (!isLoading) {
      if (isLoggedIn) {
        // 로그인 상태인 경우 메인 화면으로 이동
        RootNavigation.navigateToMain();
      }
      // 로그인되지 않은 상태는 기본적으로 Auth 스택으로 이동 (AppNavigator의 초기 경로)
    }
  }, [isLoading, isLoggedIn]);

  return (
    <>
      <AppProvider>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1CBFDC" />
          </View>
        ) : (
          <AppNavigator />
        )}
      </AppProvider>
      <AppToast theme={theme} />
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default App;
