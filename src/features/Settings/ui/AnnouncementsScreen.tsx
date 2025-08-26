import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import {Text} from '@shared/ui/typography/Text';
import {useTranslation} from 'react-i18next';
import {ChevronLeft} from '@shared/assets/images';
import Toast from 'react-native-toast-message';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

const AnnouncementsScreen = ({navigation}: any) => {
  const {t} = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // 더미 데이터
  const dummyAnnouncements: Announcement[] = [
    {
      id: '1',
      title: 'Glue 앱 업데이트 안내 (v1.0.0)',
      content:
        '안녕하세요! Glue 앱이 새로운 버전으로 업데이트되었습니다.\n\n주요 변경사항:\n• 새로운 채팅 기능 추가\n• UI/UX 개선\n• 성능 최적화\n• 버그 수정\n\n더 나은 서비스를 위해 계속 노력하겠습니다. 감사합니다!',
      date: '2024-01-15',
      isImportant: true,
    },
    {
      id: '2',
      title: '서비스 점검 안내',
      content:
        '2024년 1월 20일 새벽 2시부터 4시까지 서비스 점검이 예정되어 있습니다.\n\n점검 시간 동안에는 서비스 이용이 제한될 수 있습니다.\n\n불편을 드려 죄송합니다.',
      date: '2024-01-10',
      isImportant: true,
    },
    {
      id: '3',
      title: '개인정보 처리방침 개정 안내',
      content:
        '개인정보 처리방침이 개정되었습니다.\n\n주요 변경사항:\n• 개인정보 수집 및 이용 목적 명시\n• 개인정보 보유 및 이용기간 변경\n• 개인정보 제3자 제공 관련 사항 추가\n\n자세한 내용은 설정 > 개인정보 처리방침에서 확인하실 수 있습니다.',
      date: '2024-01-05',
      isImportant: false,
    },
    {
      id: '4',
      title: '신규 기능: 그룹 채팅방',
      content:
        '새로운 그룹 채팅방 기능이 추가되었습니다!\n\n• 최대 50명까지 참여 가능\n• 그룹 프로필 설정\n• 그룹 관리자 기능\n• 파일 공유 기능\n\n지금 바로 새로운 그룹을 만들어보세요!',
      date: '2024-01-01',
      isImportant: false,
    },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출로 변경
      await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
      setAnnouncements(dummyAnnouncements);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '공지사항을 불러오는데 실패했습니다.',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  const handleAnnouncementPress = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDetailModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderAnnouncementItem = ({item}: {item: Announcement}) => (
    <TouchableOpacity
      style={[
        styles.announcementItem,
        item.isImportant && styles.importantItem,
      ]}
      onPress={() => handleAnnouncementPress(item)}>
      <View style={styles.itemHeader}>
        <Text
          variant="body1"
          weight="semiBold"
          style={[styles.itemTitle, item.isImportant && styles.importantTitle]}>
          {item.title}
        </Text>
        {item.isImportant && (
          <View style={styles.importantBadge}>
            <Text variant="caption" weight="bold" style={styles.importantText}>
              중요
            </Text>
          </View>
        )}
      </View>
      <Text variant="caption" style={styles.itemDate}>
        {formatDate(item.date)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 20, right: 20, bottom: 20, left: 20}}>
          <ChevronLeft width={24} height={24} color="#1CBFDC" />
        </TouchableOpacity>
        <Text variant="h6" weight="semiBold">
          공지사항
        </Text>
        <View style={{width: 40}} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text variant="body1" style={styles.loadingText}>
            공지사항을 불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={announcements}
          renderItem={renderAnnouncementItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="body1" style={styles.emptyText}>
                공지사항이 없습니다.
              </Text>
            </View>
          }
        />
      )}

      {/* 공지사항 상세 모달 */}
      {selectedAnnouncement && (
        <View
          style={[
            styles.modalOverlay,
            {display: isDetailModalVisible ? 'flex' : 'none'},
          ]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text variant="h6" weight="semiBold" style={styles.modalTitle}>
                {selectedAnnouncement.title}
              </Text>
              <TouchableOpacity
                onPress={() => setIsDetailModalVisible(false)}
                style={styles.closeButton}>
                <Text variant="h6" weight="bold">
                  ×
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text variant="caption" style={styles.modalDate}>
                {formatDate(selectedAnnouncement.date)}
              </Text>
              <Text variant="body1" style={styles.modalContentText}>
                {selectedAnnouncement.content}
              </Text>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  announcementItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  importantItem: {
    backgroundColor: '#FFF8E1',
  },
  itemHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    color: '#333333',
  },
  importantTitle: {
    color: '#D32F2F',
  },
  importantBadge: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  importantText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  itemDate: {
    color: '#999999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 60,
  },
  emptyText: {
    color: '#999999',
  },
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    flex: 1,
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalDate: {
    color: '#999999',
    marginBottom: 16,
  },
  modalContentText: {
    color: '#333333',
    lineHeight: 24,
  },
};

export default AnnouncementsScreen;
