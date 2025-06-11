import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {MOCK_GROUPS} from '../model/mockData';
import {GroupItemCard} from './components/GroupItemCard';
import {Text} from '../../../shared/ui/typography/Text';
import {Search, X} from '@shared/assets/images';
import {GroupItem, GroupListNavigationProp} from '../model/types';
import {config} from '@shared/config/env';
import {secureStorage} from '@shared/lib/security';

// 최근 검색어를 저장할 AsyncStorage 키
const RECENT_SEARCHES_KEY = 'recentGroupSearches';

// API 응답 타입 정의
interface SearchResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    hasNext: boolean;
    posts: {
      postId: number;
      viewCount: number;
      categoryId: number;
      title: string;
      content: string;
      likeCount: number;
      currentParticipants: number;
      maxParticipants: number;
      createdAt: string;
      thumbnailUrl: string;
    }[];
  };
}

interface GroupSearchProps {
  navigation: GroupListNavigationProp;
}

const GroupSearch: React.FC<GroupSearchProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<GroupItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [lastPostId, setLastPostId] = useState<number | null>(null);

  // 컴포넌트 마운트 시 최근 검색어 로드
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // 최근 검색어 로드 함수
  const loadRecentSearches = async () => {
    try {
      const savedSearches = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  // 최근 검색어 저장 함수
  const saveRecentSearch = async (search: string) => {
    try {
      if (!search.trim()) return;

      // 중복 검색어 제거하고 최신 검색어를 맨 앞에 추가
      const updatedSearches = [
        search,
        ...recentSearches.filter(item => item !== search),
      ].slice(0, 10); // 최대 10개까지만 저장

      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(updatedSearches),
      );
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  // API 호출로 그룹 검색
  const searchGroups = async (text: string, lastId?: number | null) => {
    if (!text.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    try {
      // 토큰 가져오기
      const token = await secureStorage.getToken();

      const url = new URL('/api/posts/search', config.API_URL);
      url.searchParams.append('keyword', text);
      url.searchParams.append('size', '10');

      if (lastId !== null && lastId !== undefined) {
        url.searchParams.append('lastPostId', lastId.toString());
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // 토큰이 있으면 Authorization 헤더 추가
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      const data: SearchResponse = await response.json();

      if (data.isSuccess && response.ok) {
        // API 응답의 posts를 GroupItem 형태로 변환
        const transformedPosts: GroupItem[] = data.result.posts.map(post => ({
          id: post.postId.toString(),
          title: post.title,
          description: post.content,
          category: post.categoryId.toString(), // 카테고리 매핑 필요
          categoryColor: '#E3F2FD', // 기본 카테고리 색상
          categoryTextColor: '#1976D2', // 기본 카테고리 텍스트 색상
          likes: post.likeCount,
          viewCounts: post.viewCount,
          participants: `${post.currentParticipants}/${post.maxParticipants}`,
          time: new Date(post.createdAt).toLocaleDateString('ko-KR'),
          image: post.thumbnailUrl,
        }));

        if (lastId === null || lastId === undefined) {
          // 새로운 검색
          setSearchResults(transformedPosts);
        } else {
          // 더 많은 결과 로드 (페이지네이션)
          setSearchResults(prev => [...prev, ...transformedPosts]);
        }

        setHasNext(data.result.hasNext);

        // 다음 페이지를 위한 lastPostId 설정
        if (transformedPosts.length > 0) {
          setLastPostId(data.result.posts[data.result.posts.length - 1].postId);
        }
      } else {
        Alert.alert('오류', data.message || '검색 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Search API error:', error);
      Alert.alert('오류', '네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 실행 핸들러
  const handleSearch = () => {
    if (!searchText.trim()) return;

    setIsSearching(true);
    setLastPostId(null); // 새로운 검색 시 lastPostId 초기화
    searchGroups(searchText);
    saveRecentSearch(searchText);
  };

  // 더 많은 결과 로드 (무한 스크롤)
  const loadMoreResults = () => {
    if (hasNext && !isLoading && lastPostId !== null) {
      searchGroups(searchText, lastPostId);
    }
  };

  // 최근 검색어 클릭 핸들러
  const handleRecentSearchPress = (search: string) => {
    setSearchText(search);
    setIsSearching(true);
    setLastPostId(null); // 새로운 검색 시 lastPostId 초기화
    searchGroups(search);
    // 최근 검색어 목록에서 해당 검색어를 맨 앞으로 이동
    saveRecentSearch(search);
  };

  // 최근 검색어 삭제 핸들러
  const handleRemoveRecentSearch = async (search: string) => {
    const updatedSearches = recentSearches.filter(item => item !== search);
    setRecentSearches(updatedSearches);
    await AsyncStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(updatedSearches),
    );
  };

  // 전체 삭제 핸들러
  const handleClearAll = async () => {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  };

  // 그룹 아이템 클릭 핸들러
  const handleGroupPress = (groupId: string) => {
    navigation.navigate('GroupDetail', {postId: groupId});
  };

  return (
    <SafeAreaView style={styles.container}>
      {isSearching ? (
        // 검색 결과 화면
        <>
          {/* 검색 헤더 */}
          <View style={styles.searchHeader}>
            <View style={styles.searchInputContainer}>
              <Search width={18} height={18} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={
                  t('group.search.placeholder') ||
                  '제목, 모임 카테고리, 내용 검색'
                }
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                setIsSearching(false);
                setSearchText('');
              }}
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>
                {t('common.cancel') || '취소'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 검색 결과 */}
          <FlatList
            data={searchResults}
            renderItem={({item}) => (
              <GroupItemCard item={item} onPress={handleGroupPress} />
            )}
            keyExtractor={item => item.id}
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#1976D2" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Text variant="body1">
                    {t('group.search.noResults') || '검색 결과가 없습니다.'}
                  </Text>
                </View>
              ) : null
            }
          />
        </>
      ) : (
        // 검색 입력 및 최근 검색어 화면
        <ScrollView style={styles.scrollView}>
          {/* 검색 헤더 */}
          <View style={styles.searchHeader}>
            <View style={styles.searchInputContainer}>
              <Search width={18} height={18} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={
                  t('group.search.placeholder') ||
                  '제목, 모임 카테고리, 내용 검색'
                }
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                autoFocus
              />
            </View>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>
                {t('common.cancel') || '취소'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 최근 검색어 헤더 */}
          <View style={styles.recentSearchHeader}>
            <Text style={styles.recentSearchTitle}>
              {t('group.search.recentSearches') || '최근 검색어'}
            </Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={styles.clearAllText}>
                  {t('group.search.clearAll') || '전체삭제'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 최근 검색어 칩 */}
          <View style={styles.chipContainer}>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => handleRecentSearchPress(search)}>
                <Text style={styles.chipText}>{search}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveRecentSearch(search)}>
                  <X style={styles.chipCloseIcon} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
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
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
    marginHorizontal: 19,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D2D5DB',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 14,
  },
  searchInput: {
    flex: 1,
    color: '#303030',
    fontSize: 14,
  },
  searchIcon: {
    marginRight: 10,
  },
  cancelButton: {
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#9DA2AF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recentSearchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
    marginHorizontal: 19,
  },
  recentSearchTitle: {
    color: '#303030',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearAllText: {
    color: '#6C7180',
    fontSize: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginLeft: 19,
    marginRight: 19,
    marginBottom: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D2D5DB',
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 11,
    marginRight: 7,
    marginBottom: 8,
  },
  chipText: {
    color: '#384050',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 7,
  },
  chipCloseIcon: {
    width: 12,
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GroupSearch;
