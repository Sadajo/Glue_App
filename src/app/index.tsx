import React, {useEffect, useState, useCallback} from 'react';
import {AppProvider} from './providers';
import {AppNavigator} from './providers/navigation';
import {View, ActivityIndicator, StyleSheet, AppState} from 'react-native';
import * as RootNavigation from './navigation/RootNavigation';
import {useTheme} from './providers/theme';
import {AppToast} from '@/shared/ui/Toast';
import {fcmService} from '@/shared/lib/firebase';
import {localNotificationService} from '@/shared/lib/notifications/localNotification';
import {logger} from '@/shared/lib/logger';
import {secureStorage} from '@/shared/lib/security';
import NetInfo from '@react-native-community/netinfo';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTokenChecking, setIsTokenChecking] = useState(false);
  const {theme} = useTheme();

  // 자동 로그인 검증 함수
  const checkAutoLogin = useCallback(async (): Promise<boolean> => {
    if (isTokenChecking) {
      logger.info('토큰 검증이 이미 진행 중입니다.');
      return isLoggedIn;
    }

    setIsTokenChecking(true);
    try {
      logger.info('자동 로그인 검증 시작');

      // 개선된 토큰 검증 사용 (서버 검증 포함)
      const isValid = await secureStorage.validateTokenCompletely();

      if (isValid) {
        logger.info('자동 로그인 성공 - 토큰 검증 완료');
        return true;
      } else {
        logger.info('자동 로그인 실패 - 토큰이 유효하지 않음');
        return false;
      }
    } catch (error) {
      logger.error('자동 로그인 검증 중 오류:', error);
      // 오류 발생 시 안전을 위해 토큰 삭제
      await secureStorage.removeToken();
      return false;
    } finally {
      setIsTokenChecking(false);
    }
  }, [isLoggedIn, isTokenChecking]);

  // 앱 상태 변화 감지 및 토큰 재검증
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: string) => {
      if (nextAppState === 'active' && isLoggedIn) {
        logger.info('앱이 포그라운드로 복귀 - 토큰 재검증 실행');
        const isValid = await checkAutoLogin();
        if (!isValid) {
          setIsLoggedIn(false);
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription?.remove();
  }, [isLoggedIn, checkAutoLogin]);

  // 네트워크 상태 변화 감지
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && isLoggedIn) {
        logger.info('네트워크 연결됨 - 토큰 재검증 실행');
        checkAutoLogin().then(isValid => {
          if (!isValid) {
            setIsLoggedIn(false);
          }
        });
      }
    });

    return unsubscribe;
  }, [isLoggedIn, checkAutoLogin]);

  useEffect(() => {
    // 앱 초기화 로직
    const initializeApp = async () => {
      try {
        // 1. 먼저 자동 로그인 처리 (가장 중요한 상태 결정)
        const autoLoginResult = await checkAutoLogin();
        setIsLoggedIn(autoLoginResult);

        // 2. 로컬 알림 서비스 초기화
        localNotificationService.init();

        // 3. FCM 관련 초기화는 병렬로 처리
        await Promise.all([
          fcmService.requestPermission(),
          fcmService.registerDevice(),
        ]);

        // 4. FCM 토큰 가져오기 (백그라운드에서 진행하여 앱 로딩 속도에 영향 없도록)
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
      } catch (error) {
        logger.error('앱 초기화 오류:', error);
        // 오류 발생 시에도 기본적으로 로그아웃 상태로
        setIsLoggedIn(false);
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
      // 백그라운드에서 알림 처리
      localNotificationService.showFCMNotification(message);
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForegroundMessage();
    };
  }, [checkAutoLogin]);

  // 네비게이션이 준비된 후 자동로그인 결과에 따라 네비게이션 실행
  const handleNavigationReady = () => {
    if (!isLoading && isLoggedIn) {
      // 로그인 상태인 경우 메인 화면으로 이동
      RootNavigation.navigateToMain();
    }
  };

  return (
    <>
      <AppProvider onNavigationReady={handleNavigationReady}>
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
