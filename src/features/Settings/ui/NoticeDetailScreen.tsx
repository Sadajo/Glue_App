import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Text} from '@shared/ui/typography/Text';
import {useTranslation} from 'react-i18next';
import {ChevronLeft} from '@shared/assets/images';
import {useNotice} from '../api/hooks';
import {colors} from '@/app/styles/colors';

interface NoticeDetailScreenProps {
  route: {
    params: {
      noticeId: number;
    };
  };
  navigation: any;
}

const NoticeDetailScreen: React.FC<NoticeDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const {t} = useTranslation();
  const {noticeId} = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 공지사항 상세 정보 조회 훅 사용
  const {data: response, isLoading, isError, error} = useNotice(noticeId);

  // 로딩 중 표시
  if (isLoading) {
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#384050" />
        </View>
      </SafeAreaView>
    );
  }

  // 에러 표시
  if (isError || !response?.data) {
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
        <View style={styles.errorContainer}>
          <Text variant="body1" color="#e74c3c" align="center">
            {error?.message || '공지사항을 불러오는데 실패했습니다.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 데이터에서 필요한 정보 추출
  const notice = response.data;
  const imageUrls = notice.imageUrls || [];
  const screenWidth = Dimensions.get('window').width;

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
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

      <ScrollView style={styles.content}>
        {/* 공지사항 헤더 정보 */}
        <View style={styles.noticeHeader}>
          <View style={styles.noticeHeaderLeft}>
            <View style={styles.noticeIcon}>
              <Text style={styles.noticeIconText}>GLUE</Text>
            </View>
            <Text variant="h6" weight="semiBold" style={styles.noticeTitle}>
              글루 GLUE
            </Text>
          </View>
          <View style={styles.noticeHeaderRight}>
            <Text variant="caption" style={styles.noticeDateTime}>
              {formatDate(notice.createdAt)}
            </Text>
          </View>
        </View>

        {/* 제목 */}
        <Text variant="h4" weight="bold" style={styles.title}>
          {notice.title}
        </Text>

        {/* 내용 */}
        <Text variant="body1" style={styles.content}>
          {notice.content}
        </Text>

        {/* 이미지 슬라이더 */}
        {imageUrls.length > 0 && (
          <View style={styles.imageContainer}>
            <FlatList
              data={imageUrls}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              onViewableItemsChanged={({viewableItems}) => {
                if (viewableItems.length > 0) {
                  setCurrentImageIndex(viewableItems[0].index || 0);
                }
              }}
              viewabilityConfig={{
                itemVisiblePercentThreshold: 50,
              }}
              renderItem={({item}) => (
                <Image
                  source={{uri: item}}
                  resizeMode="cover"
                  style={[styles.contentImage, {width: screenWidth - 38}]}
                />
              )}
            />
            {/* 이미지 인디케이터 */}
            {imageUrls.length > 1 && (
              <View style={styles.indicatorContainer}>
                {imageUrls.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      {
                        backgroundColor:
                          index === currentImageIndex
                            ? colors.white
                            : 'rgba(255, 255, 255, 0.5)',
                        width: index === currentImageIndex ? 12 : 8,
                        height: index === currentImageIndex ? 12 : 8,
                        borderRadius: index === currentImageIndex ? 6 : 4,
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* 일러스트레이션 */}
        <View style={styles.illustration}>
          <View style={styles.illustrationCharacter}>
            <Text style={styles.characterText}>😊</Text>
          </View>
          <View style={styles.illustrationNote}>
            <Text style={styles.noteText}>되면 한다</Text>
          </View>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 19,
  },
  noticeHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  noticeHeaderLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  noticeHeaderRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  noticeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#44FF54',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 8,
  },
  noticeIconText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noticeTitle: {
    color: '#333333',
  },
  noticeDateTime: {
    color: '#999999',
  },
  title: {
    color: '#333333',
    marginTop: 16,
    marginBottom: 16,
  },
  content: {
    color: '#333333',
    lineHeight: 24,
    marginBottom: 24,
  },
  imageContainer: {
    marginBottom: 24,
    position: 'relative' as const,
  },
  contentImage: {
    height: 200,
    borderRadius: 8,
  },
  indicatorContainer: {
    position: 'absolute' as const,
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  indicator: {
    marginHorizontal: 4,
  },
  illustration: {
    alignItems: 'center' as const,
    marginTop: 20,
    marginBottom: 40,
  },
  illustrationCharacter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  characterText: {
    fontSize: 32,
  },
  illustrationNote: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  noteText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
  },
};

export default NoticeDetailScreen;
