import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import {CategorySectionProps} from '../../model/types';
import MeetingCard from './MeetingCard';
import {Text} from '../../../../shared/ui/typography/Text';
import {PopularPost} from '../../api/carouselApi';

interface TransformedMeetingCard {
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

interface CategorySectionPropsWithApi
  extends Omit<CategorySectionProps, 'cards'> {
  apiFunction: (
    size: number,
  ) => Promise<{success: boolean; data: PopularPost[]; message?: string}>;
  icon: React.ReactNode;
  backgroundColor?: string;
}

const CategorySection = ({
  title,
  apiFunction,
  icon,
  backgroundColor,
}: CategorySectionPropsWithApi) => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const [cards, setCards] = useState<TransformedMeetingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 더보기 버튼 클릭 핸들러
  const handleSeeAllPress = useCallback(() => {
    (navigation as any).navigate('PopularPostsList', {
      title: title,
      apiFunction: apiFunction,
    });
  }, [navigation, title, apiFunction]);

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await apiFunction(2); // 2개만 가져오기
        if (response.success && response.data) {
          const transformedCards = response.data.map(transformPostToCard);
          console.log('transformedCards', transformedCards);
          setCards(transformedCards);
        }
      } catch (error) {
        console.error('게시글 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [apiFunction, transformPostToCard]);

  return (
    <View
      style={[
        styles.container,
        backgroundColor && {
          backgroundColor,
          paddingVertical: 16,
          minHeight: 200,
        },
      ]}>
      <View style={styles.titleContainer}>
        <View style={styles.titleIconContainer}>
          {icon}
          <Text
            variant="subtitle1"
            weight="bold"
            color="#384050"
            style={styles.sectionTitle}>
            {title}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSeeAllPress}>
          <Text variant="body2" color="#9DA2AF" style={styles.seeAllText}>
            {t('home.seeAll')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.verticalContainer}>
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <Text variant="body2" color="#9DA2AF" style={styles.emptyText}>
              {t('home.loading')}
            </Text>
          </View>
        ) : cards.length > 0 ? (
          cards.map((card, index) => (
            <View key={index} style={styles.cardWrapper}>
              <MeetingCard {...card} />
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text variant="body2" color="#9DA2AF" style={styles.emptyText}>
              {t('home.emptyState')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
    marginHorizontal: 19,
  },
  sectionTitle: {
    fontSize: 18,
  },
  seeAllText: {
    fontSize: 14,
  },
  verticalContainer: {
    marginBottom: 32,
    paddingHorizontal: 19,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  emptyContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  titleIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default CategorySection;
