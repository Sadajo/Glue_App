import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import {Text} from '@shared/ui/typography/Text';
import {useTranslation} from 'react-i18next';
import {ChevronLeft} from '@shared/assets/images';
import {useNotices} from '../api/hooks';
import Toast from 'react-native-toast-message';

import {NoticeDto} from '../api/noticeApi';

const AnnouncementsScreen = ({navigation}: any) => {
  const {t} = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  // 공지사항 목록 조회 훅 사용
  const {data: response, isLoading, isError, error, refetch} = useNotices();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAnnouncementPress = (notice: NoticeDto) => {
    navigation.navigate('NoticeDetail', {noticeId: notice.noticeId});
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  const renderAnnouncementItem = ({item}: {item: NoticeDto}) => (
    <TouchableOpacity
      style={styles.announcementItem}
      onPress={() => handleAnnouncementPress(item)}>
      <View style={styles.itemContent}>
        <View style={styles.itemLeft}>
          <Text variant="body1" weight="semiBold" style={styles.itemTitle}>
            {item.title}
          </Text>
          <Text
            variant="body2"
            style={styles.itemDescription}
            numberOfLines={2}>
            {item.content.split('\n')[0]}
          </Text>
          <View style={styles.itemMeta}>
            <Text variant="caption" style={styles.itemLikes}>
              ♥ 20
            </Text>
            <Text variant="caption" style={styles.itemDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <View style={styles.itemRight}>
          <View style={styles.thumbnail}>
            <Text style={styles.thumbnailText}>😊</Text>
          </View>
        </View>
      </View>
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text variant="body1" style={styles.loadingText}>
            공지사항을 불러오는 중...
          </Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text variant="body1" style={styles.errorText}>
            {error?.message || '공지사항을 불러오는데 실패했습니다.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={response?.data || []}
          renderItem={renderAnnouncementItem}
          keyExtractor={item => item.noticeId.toString()}
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
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  itemLeft: {
    flex: 1,
    marginRight: 16,
  },
  itemRight: {
    width: 60,
    height: 60,
  },
  itemTitle: {
    color: '#333333',
    marginBottom: 4,
  },
  itemDescription: {
    color: '#666666',
    marginBottom: 8,
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  itemLikes: {
    color: '#999999',
    marginRight: 8,
  },
  itemDate: {
    color: '#999999',
  },
  thumbnail: {
    width: 60,
    height: 60,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  thumbnailText: {
    fontSize: 24,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center' as const,
  },
};

export default AnnouncementsScreen;
