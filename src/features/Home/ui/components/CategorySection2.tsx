import React, {useState, useEffect} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {CategorySectionProps} from '../../model/types';
import MeetingCard from './MeetingCard';
import {Text} from '../../../../shared/ui/typography/Text';
import LanguageIcon from '../../../../shared/assets/images/language.svg';
import {getLanguageMatchPosts, PopularPost} from '../../api/carouselApi';

interface TransformedMeetingCard {
  category: string;
  categoryColor: string;
  categoryBgColor: string;
  date: string;
  author: string;
  authorImage: string;
  viewCount: string;
  title: string;
  description: string;
  likeCount: string;
  memberCount: string;
}

const CategorySection = ({title}: Omit<CategorySectionProps, 'cards'>) => {
  const {t} = useTranslation();
  const [cards, setCards] = useState<TransformedMeetingCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API에서 받은 데이터를 MeetingCard props 형태로 변환
  const transformPostToCard = (post: PopularPost): TransformedMeetingCard => {
    return {
      category: post.category,
      categoryColor: post.categoryColor,
      categoryBgColor: post.categoryBgColor,
      date: new Date(post.meetingDate).toLocaleDateString(),
      author: post.authorNickname,
      authorImage: post.authorProfileImageUrl,
      viewCount: post.viewCount.toString(),
      title: post.title,
      description: post.content,
      likeCount: post.likeCount.toString(),
      memberCount: `${post.currentParticipants}/${post.maxParticipants}`,
    };
  };

  useEffect(() => {
    const fetchLanguageMatchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await getLanguageMatchPosts(2); // 2개만 가져오기
        if (response.success && response.data?.posts) {
          const transformedCards = response.data.posts.map(transformPostToCard);
          setCards(transformedCards);
        }
      } catch (error) {
        console.error('언어 교환 모임 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguageMatchPosts();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.titleIconContainer}>
          <LanguageIcon width={24} height={24} />
          <Text
            variant="subtitle1"
            weight="bold"
            color="#384050"
            style={styles.sectionTitle}>
            {title}
          </Text>
        </View>
        <TouchableOpacity>
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
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    width: '100%',
    flex: 1,
    minHeight: 400,
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
