import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Text,
} from 'react-native';
import {TabBar, NotificationItem} from './components';
import {NotificationIconType} from './components/NotificationItem';
import {useNewsNotifications, useNoticeNotifications} from '../api/hooks';

// 알림 타입에 따른 아이콘 매핑
const getIconTypeFromNotificationType = (
  type: string,
): NotificationIconType => {
  switch (type.toLowerCase()) {
    case 'meeting':
      return 'meeting';
    case 'guestbook':
      return 'guestbook';
    case 'reply':
      return 'reply';
    case 'update':
      return 'update';
    case 'party':
      return 'party';
    default:
      return 'meeting'; // 기본값
  }
};

// 날짜 포맷팅 함수
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // 오늘인 경우 시간만 표시
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else if (diffDays < 7) {
      // 일주일 이내인 경우 "n일 전" 형식
      return `${diffDays}일 전`;
    } else {
      // 그 외의 경우 날짜 표시
      return date
        .toLocaleDateString('ko-KR', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
        .replace(/\./g, '.')
        .replace(/ /g, '. ');
    }
  } catch (error) {
    console.error('날짜 파싱 오류:', error);
    return dateString;
  }
};

const NotificationsScreen = () => {
  const [activeTab, setActiveTab] = useState<'news' | 'notice'>('news');

  // 일반 알림 API 호출 (소식 탭)
  const {
    data: newsData,
    isLoading: newsLoading,
    error: newsError,
  } = useNewsNotifications({
    pageSize: 10,
  });

  // 공지 알림 API 호출 (공지 탭)
  const {
    data: noticeData,
    isLoading: noticeLoading,
    error: noticeError,
  } = useNoticeNotifications({
    pageSize: 10,
  });

  const handleTabChange = (tab: 'news' | 'notice') => {
    setActiveTab(tab);
  };

  const renderNotifications = () => {
    const isNews = activeTab === 'news';
    const data = isNews ? newsData : noticeData;
    const isLoading = isNews ? newsLoading : noticeLoading;
    const error = isNews ? newsError : noticeError;
    const tabName = isNews ? '소식' : '공지사항';

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1CBFDC" />
          <Text style={styles.loadingText}>{tabName}을 불러오는 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {tabName}을 불러오는데 실패했습니다.
          </Text>
          <Text style={styles.errorSubText}>
            네트워크 연결을 확인하고 다시 시도해주세요.
          </Text>
        </View>
      );
    }

    if (!data?.data || data.data.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{tabName}이 없습니다.</Text>
        </View>
      );
    }

    return data.data.map(notification => (
      <NotificationItem
        key={notification.notificationId.toString()}
        iconType={getIconTypeFromNotificationType(notification.type)}
        title={notification.title}
        content={notification.content}
        time={formatDate(notification.createdAt)}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.notificationsContainer}>
          {renderNotifications()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  notificationsContainer: {
    marginHorizontal: 19,
    marginTop: 26,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
  },
});

export default NotificationsScreen;
