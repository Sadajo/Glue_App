import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {groupDetailStyles} from '../styles/groupDetailStyles';
import {Text} from '../../../../shared/ui/typography/Text';
import {Heart, HeartFill} from '@shared/assets/images';
import {useTranslation} from 'react-i18next';
import {useToggleLike} from '../../api/hooks';

interface GroupLikesProps {
  likeCount: number;
  postId: number;
  isLiked?: boolean;
}

/**
 * 모임 좋아요 정보 컴포넌트
 */
const GroupLikes: React.FC<GroupLikesProps> = ({likeCount, postId, isLiked = false}) => {
  const {t} = useTranslation();
  const toggleLikeMutation = useToggleLike(postId);

  const handleLikePress = () => {
    if (!toggleLikeMutation.isPending) {
      toggleLikeMutation.mutate();
    }
  };

  // 좋아요 상태에 따라 적절한 아이콘 선택
  const HeartIcon = isLiked ? HeartFill : Heart;

  return (
    <Pressable
      style={groupDetailStyles.likesTotalContainer}
      onPress={handleLikePress}
      disabled={toggleLikeMutation.isPending}>
      <HeartIcon style={[groupDetailStyles.likesTotalIcon, styles.heartIcon, isLiked && styles.likedIcon]} />
      <Text variant="body2" style={groupDetailStyles.likesTotalText}>
        {t('group.detail.likesCount', {count: likeCount})}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  heartIcon: {
    // 기본 하트 아이콘 스타일
  },
  likedIcon: {
    // 좋아요된 상태의 하트 아이콘 스타일 (예: 색상 변경)
    tintColor: '#FF4757', // 빨간색으로 표시
  },
});

export default GroupLikes;
