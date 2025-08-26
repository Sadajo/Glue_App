import React, {useState, useCallback, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Text} from '../../../shared/ui/typography/Text';
import {PopularPost} from '../api/carouselApi';
import MeetingCard from './components/MeetingCard';
import {ChevronLeft, Bell} from '../../../shared/assets/images';
import FireIcon from '../../../shared/assets/images/fire-icon.svg';
import LanguageIcon from '../../../shared/assets/images/language.svg';

interface RouteParams {
  title: string;
  apiFunction: (
    size: number,
  ) => Promise<{success: boolean; data: PopularPost[]; message?: string}>;
}

interface TransformedMeetingCard {
  postId: number;
  category: string;
  categoryColor: string;
  categoryBgColor: string;
  date: string;
  viewCount: string;
  title: string;
  description: string;
  likeCount: string;
  memberCount: string;
}

// 커스텀 헤더 컴포넌트
const CustomHeader: React.FC<{title: string}> = ({title}) => {
  const navigation = useNavigation<any>();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBellPress = () => {
    navigation.navigate('NotificationsScreen');
  };

  // 제목에 따라 아이콘 결정
  const getIcon = () => {
    if (title.includes('인기') || title.includes('popular')) {
      return <FireIcon width={24} height={24} />;
    } else {
      return <LanguageIcon width={24} height={24} />;
    }
  };

  return (
    <SafeAreaView style={headerStyles.safeArea}>
      <View style={headerStyles.container}>
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity
          onPress={handleBackPress}
          style={headerStyles.backButton}
          hitSlop={{top: 20, right: 20, bottom: 20, left: 20}}>
          <ChevronLeft width={24} height={24} color="#1CBFDC" />
        </TouchableOpacity>

        {/* 타이틀 */}
        <View style={headerStyles.titleContainer}>
          {getIcon()}
          <Text style={headerStyles.title}>{title}</Text>
        </View>

        {/* 알림 버튼 */}
        <TouchableOpacity
          onPress={handleBellPress}
          style={headerStyles.bellButton}
          hitSlop={{top: 20, right: 20, bottom: 20, left: 20}}>
          <Bell width={24} height={24} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const PopularPostsList: React.FC = () => {
  const route = useRoute();
  const {t} = useTranslation();
  const {title, apiFunction} = route.params as RouteParams;

  const [posts, setPosts] = useState<TransformedMeetingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 카테고리 ID에서 배경색으로 변환
  const getCategoryColorFromId = useCallback((categoryId: number): string => {
    switch (categoryId) {
      case 1: // 공부
        return '#DEE9FC';
      case 2: // 친목
        return '#E1FBE8';
      case 3: // 도움
        return '#FFF1BB';
      default:
        return '#384050';
    }
  }, []);

  // 카테고리 ID에서 텍스트 색상으로 변환
  const getCategoryTextColorFromId = useCallback(
    (categoryId: number): string => {
      switch (categoryId) {
        case 1: // 공부
          return '#263FA9';
        case 2: // 친목
          return '#306339';
        case 3: // 도움
          return '#A47C5E';
        default:
          return '#384050';
      }
    },
    [],
  );

  // 카테고리 ID에서 텍스트로 변환
  const getCategoryTextFromId = useCallback(
    (categoryId: number): string => {
      switch (categoryId) {
        case 1:
          return t('group.categories.study');
        case 2:
          return t('group.categories.social');
        case 3:
          return t('group.categories.help');
        default:
          return '';
      }
    },
    [t],
  );

  // API에서 받은 데이터를 MeetingCard props 형태로 변환
  const transformPostToCard = useCallback(
    (post: PopularPost): TransformedMeetingCard => {
      return {
        postId: post.postId,
        category: getCategoryTextFromId(post.categoryId),
        categoryColor: getCategoryTextColorFromId(post.categoryId),
        categoryBgColor: getCategoryColorFromId(post.categoryId),
        date: new Date(post.createdAt).toLocaleDateString(),
        viewCount: '0', // 기본값 설정 (API 응답에 없음)
        title: post.title,
        description: post.content,
        likeCount: post.likeCount.toString(),
        memberCount: `${post.currentParticipants}/${post.maxParticipants}`,
      };
    },
    [getCategoryTextFromId, getCategoryTextColorFromId, getCategoryColorFromId],
  );

  // 데이터 로드 함수
  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('API 호출 시작:', title);
      const response = await apiFunction(15); // 15개 가져오기
      console.log('API 응답:', response);

      if (response.success) {
        if (Array.isArray(response.data)) {
          const transformedCards = response.data.map(transformPostToCard);
          console.log('변환된 카드들:', transformedCards);
          setPosts(transformedCards);
        } else {
          console.error(
            'response.data가 배열이 아님:',
            typeof response.data,
            response.data,
          );
          setPosts([]);
        }
      } else {
        console.error('API 호출 실패:', response.message || 'Unknown error');
        setPosts([]);
      }
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, transformPostToCard, title]);

  // 새로고침 함수
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPosts();
    setIsRefreshing(false);
  }, [loadPosts]);

  // 게시글 클릭 핸들러 (추후 구현)
  // const handlePostPress = useCallback((postId: string) => {
  //   console.log('Post pressed:', postId);
  // }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 게시글 렌더링 함수
  const renderPost = useCallback(({item}: {item: TransformedMeetingCard}) => {
    return (
      <View style={styles.cardWrapper}>
        <MeetingCard {...item} />
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <CustomHeader title={title} />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1CBFDC" />
          <Text variant="body2" color="#9DA2AF" style={styles.loadingText}>
            {t('home.loading')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#1CBFDC']}
              tintColor={'#1CBFDC'}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text variant="body2" color="#9DA2AF">
                {t('home.emptyState')}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

// 헤더 스타일
const headerStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 19,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  bellButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 19,
    paddingTop: 16,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
});

export default PopularPostsList;
