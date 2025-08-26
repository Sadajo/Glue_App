import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {Platform} from 'react-native';
import {logger} from '@/shared/lib/logger';
import * as RootNavigation from '@/app/navigation/RootNavigation';

/**
 * 로컬 푸시 알림 서비스
 * FCM 메시지를 로컬 알림으로 표시합니다.
 */
export class LocalNotificationService {
  private static instance: LocalNotificationService;

  static getInstance(): LocalNotificationService {
    if (!LocalNotificationService.instance) {
      LocalNotificationService.instance = new LocalNotificationService();
    }
    return LocalNotificationService.instance;
  }

  /**
   * 알림 서비스 초기화
   */
  init(): void {
    if (Platform.OS === 'android') {
      this.initAndroid();
    } else {
      this.initIOS();
    }
  }

  /**
   * Android 알림 초기화
   */
  private initAndroid(): void {
    PushNotification.configure({
      onRegister: function (token: any) {
        logger.info('LOCAL NOTIFICATION TOKEN:', token);
      },

      onNotification: function (notification: any) {
        logger.info('LOCAL NOTIFICATION:', notification);

        // 알림 탭 시 처리
        if (notification.userInteraction) {
          // FCM 데이터가 있으면 처리
          if (notification.data && notification.data.type) {
            LocalNotificationService.getInstance().handleNotificationTap(
              notification.data,
            );
          }
        }

        // iOS에서는 필수
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      onAction: function (notification: any) {
        logger.info('NOTIFICATION ACTION:', notification.action);
        logger.info('NOTIFICATION:', notification);
      },

      onRegistrationError: function (err: any) {
        logger.error('NOTIFICATION REGISTRATION ERROR:', err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Android 알림 채널 생성
    PushNotification.createChannel(
      {
        channelId: 'glue-default',
        channelName: 'Glue 기본 알림',
        channelDescription: 'Glue 앱의 기본 알림 채널입니다.',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created: boolean) => {
        logger.info(`알림 채널 생성됨: ${created}`);
      },
    );

    // 채팅 알림 채널
    PushNotification.createChannel(
      {
        channelId: 'glue-chat',
        channelName: 'Glue 채팅 알림',
        channelDescription: 'Glue 앱의 채팅 메시지 알림입니다.',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created: boolean) => {
        logger.info(`채팅 알림 채널 생성됨: ${created}`);
      },
    );

    // 모임 알림 채널
    PushNotification.createChannel(
      {
        channelId: 'glue-meeting',
        channelName: 'Glue 모임 알림',
        channelDescription: 'Glue 앱의 모임 관련 알림입니다.',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created: boolean) => {
        logger.info(`모임 알림 채널 생성됨: ${created}`);
      },
    );
  }

  /**
   * iOS 알림 초기화
   */
  private initIOS(): void {
    PushNotificationIOS.addEventListener('register', (token: any) => {
      logger.info('iOS PUSH TOKEN:', token);
    });

    PushNotificationIOS.addEventListener('registrationError', (error: any) => {
      logger.error('iOS PUSH REGISTRATION ERROR:', error);
    });

    PushNotificationIOS.addEventListener(
      'notification',
      (notification: any) => {
        logger.info('iOS NOTIFICATION:', notification);

        // 알림 탭 시 처리
        if (notification.getData().userInteraction === 1) {
          const data = notification.getData();
          if (data.type) {
            this.handleNotificationTap(data);
          }
        }

        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
    );

    // iOS 권한 요청
    PushNotificationIOS.requestPermissions();
  }

  /**
   * FCM 메시지를 로컬 알림으로 표시
   */
  showFCMNotification(remoteMessage: any): void {
    try {
      const {notification, data} = remoteMessage;

      if (!notification) {
        logger.warn('알림 데이터가 없습니다.');
        return;
      }

      const channelId = this.getChannelId(data?.type);
      const title = notification.title || 'Glue';
      const message = notification.body || '';

      if (Platform.OS === 'android') {
        PushNotification.localNotification({
          channelId,
          title,
          message,
          playSound: true,
          soundName: 'default',
          importance: 'high',
          vibrate: true,
          vibration: 300,
          priority: 'high',
          userInfo: data || {},
          actions: ['확인'],
        });
      } else {
        PushNotificationIOS.presentLocalNotification({
          alertTitle: title,
          alertBody: message,
          userInfo: data || {},
        });
      }

      logger.info('로컬 알림 표시됨:', {title, message, data});
    } catch (error) {
      logger.error('로컬 알림 표시 오류:', error);
    }
  }

  /**
   * 알림 타입에 따른 채널 ID 반환
   */
  private getChannelId(type?: string): string {
    switch (type) {
      case 'chat':
      case 'message':
        return 'glue-chat';
      case 'meeting':
      case 'party':
        return 'glue-meeting';
      default:
        return 'glue-default';
    }
  }

  /**
   * 알림 탭 시 네비게이션 처리
   */
  private handleNotificationTap(data: any): void {
    try {
      logger.info('알림 탭 처리:', data);

      // 네비게이션 처리는 RootNavigation을 통해 수행
      // 이 함수는 나중에 RootNavigation과 연동됩니다
      if (data.type && data.targetId) {
        this.navigateToScreen(data.type, data.targetId);
      }
    } catch (error) {
      logger.error('알림 탭 처리 오류:', error);
    }
  }

  /**
   * 화면 네비게이션 처리
   */
  private navigateToScreen(type: string, targetId: string): void {
    logger.info(`네비게이션 요청: ${type}, ${targetId}`);

    // RootNavigation을 통한 네비게이션 처리
    RootNavigation.navigateFromNotification({
      type,
      targetId,
    });
  }

  /**
   * 모든 알림 제거
   */
  clearAllNotifications(): void {
    if (Platform.OS === 'android') {
      PushNotification.cancelAllLocalNotifications();
    } else {
      PushNotificationIOS.removeAllDeliveredNotifications();
    }
    logger.info('모든 로컬 알림 제거됨');
  }

  /**
   * 배지 카운트 설정 (iOS)
   */
  setBadgeCount(count: number): void {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(count);
    }
  }
}

export const localNotificationService = LocalNotificationService.getInstance();
