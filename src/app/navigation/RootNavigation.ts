import {
  createNavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';

// 네비게이션 참조 생성
export const navigationRef = createNavigationContainerRef();

/**
 * 특정 화면으로 이동하는 함수
 * @param name 이동할 화면 이름
 * @param params 전달할 파라미터
 */
export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    // @ts-ignore - 타입 오류 무시
    navigationRef.navigate(name, params);
  } else {
    // 네비게이션이 준비되지 않은 경우 오류 로깅
    console.error('Navigation is not ready yet!');
  }
}

/**
 * 이전 화면으로 돌아가는 함수
 */
export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  } else {
    console.error('Cannot go back or navigation is not ready!');
  }
}

/**
 * 네비게이션 스택을 리셋하는 함수
 * @param routes 새로운 라우트 배열
 * @param index 활성화할 라우트 인덱스
 */
export function reset(
  routes: {name: string; params?: object}[],
  index: number = 0,
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes,
      }),
    );
  } else {
    console.error('Navigation is not ready yet!');
  }
}

/**
 * 메인 화면으로 이동하는 특수 함수
 * 복잡한 중첩 네비게이션 구조를 처리합니다.
 */
export function navigateToMain() {
  if (navigationRef.isReady()) {
    // 루트 네비게이션 상태를 리셋하고 메인으로 이동
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
          },
        ],
      }),
    );
  } else {
    console.error('Navigation is not ready yet!');
  }
}

/**
 * 특정 탭으로 이동하는 함수
 * @param tabName 이동할 탭 이름
 */
export function navigateToTab(tabName: string) {
  if (navigationRef.isReady()) {
    // 중첩된 네비게이션을 처리하여 탭으로 이동
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'Main',
        params: {
          screen: 'MainTabs',
          params: {
            screen: tabName,
          },
        },
      }),
    );
  } else {
    console.error('Navigation is not ready yet!');
  }
}

/**
 * 현재 네비게이션 상태를 가져오는 함수
 */
export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}

/**
 * 인증 화면(로그인)으로 이동하는 함수
 * 로그아웃 시 사용됩니다.
 */
export function navigateToAuth() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Auth',
          },
        ],
      }),
    );
  } else {
    console.error('Navigation is not ready yet!');
  }
}

/**
 * 알림 화면으로 이동하는 함수
 */
export function navigateToNotifications() {
  navigateToTab('Notifications');
}

/**
 * 채팅방으로 이동하는 함수
 * @param roomId 채팅방 ID
 * @param roomType 채팅방 타입 ('dm' | 'group')
 */
export function navigateToChatRoom(
  roomId: string,
  roomType: 'dm' | 'group' = 'dm',
) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'Main',
        params: {
          screen: 'MainTabs',
          params: {
            screen: 'Chat',
            params: {
              screen: roomType === 'dm' ? 'DmChatRoom' : 'GroupChatRoom',
              params: {
                roomId,
              },
            },
          },
        },
      }),
    );
  } else {
    console.error('Navigation is not ready yet!');
  }
}

/**
 * 모임 상세 화면으로 이동하는 함수
 * @param meetingId 모임 ID
 */
export function navigateToMeetingDetail(meetingId: string) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'Main',
        params: {
          screen: 'MainTabs',
          params: {
            screen: 'Meeting',
            params: {
              screen: 'MeetingDetail',
              params: {
                meetingId,
              },
            },
          },
        },
      }),
    );
  } else {
    console.error('Navigation is not ready yet!');
  }
}

/**
 * 프로필 화면으로 이동하는 함수
 * @param userId 사용자 ID (선택적)
 */
export function navigateToProfile(userId?: string) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'Main',
        params: {
          screen: 'MainTabs',
          params: {
            screen: 'Profile',
            params: userId ? {userId} : undefined,
          },
        },
      }),
    );
  } else {
    console.error('Navigation is not ready yet!');
  }
}

/**
 * FCM 알림 데이터를 기반으로 해당 화면으로 네비게이션하는 함수
 * @param notificationData FCM 알림 데이터
 */
export function navigateFromNotification(notificationData: any) {
  const {type, targetId, roomType} = notificationData;

  console.log('FCM 알림으로부터 네비게이션:', {type, targetId, roomType});

  switch (type) {
    case 'chat':
    case 'message':
      if (targetId) {
        navigateToChatRoom(targetId, roomType || 'dm');
      } else {
        navigateToTab('Chat');
      }
      break;

    case 'meeting':
    case 'party':
      if (targetId) {
        navigateToMeetingDetail(targetId);
      } else {
        navigateToTab('Meeting');
      }
      break;

    case 'profile':
    case 'follow':
      if (targetId) {
        navigateToProfile(targetId);
      } else {
        navigateToTab('Profile');
      }
      break;

    case 'notification':
    case 'notice':
      navigateToNotifications();
      break;

    default:
      // 알 수 없는 타입인 경우 알림 화면으로 이동
      navigateToNotifications();
      break;
  }
}
