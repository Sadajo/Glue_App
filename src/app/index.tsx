import React, {useEffect} from 'react';
import {AppProvider} from './providers';
import {AppNavigator, NavigationProvider} from './providers/navigation';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {useTheme} from './providers/theme';
import {AppToast} from '@/shared/ui/Toast';
import {fcmService} from '@/shared/lib/firebase';
import {localNotificationService} from '@/shared/lib/notifications/localNotification';
import {logger} from '@/shared/lib/logger';

// 로딩 컴포넌트를 별도로 분리
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#1CBFDC" />
  </View>
);

// 앱 메인 컴포넌트
const AppContent = () => {
  const {theme} = useTheme();

  useEffect(() => {
    // 앱 초기화 로직
    const initializeApp = async () => {
      try {
        // 1. 로컬 알림 서비스 초기화
        localNotificationService.init();

        // 2. FCM 관련 초기화 (병렬 처리)
        await Promise.all([
          fcmService.requestPermission(),
          fcmService.registerDevice(),
        ]);

        // 3. FCM 토큰 가져오기 (백그라운드에서 진행)
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
      }
    };

    initializeApp();

    // FCM 토큰 갱신 리스너 설정
    const unsubscribeTokenRefresh = fcmService.registerTokenRefreshListener(
      newToken => {
        logger.info('FCM 토큰이 갱신되었습니다:', newToken);
      },
    );

    // FCM Foreground 메시지 리스너 설정
    const unsubscribeForegroundMessage =
      fcmService.registerForegroundMessageListener(message => {
        logger.info('Foreground 메시지 수신:', message);
        localNotificationService.showFCMNotification(message);
      });

    // FCM Background 메시지 리스너 설정
    fcmService.registerBackgroundMessageListener(async message => {
      logger.info('Background 메시지 수신:', message);
      localNotificationService.showFCMNotification(message);
    });

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForegroundMessage();
    };
  }, []);

  return (
    <>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
      <AppToast theme={theme} />
    </>
  );
};

const App = () => {
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
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
