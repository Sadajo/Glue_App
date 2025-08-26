import React from 'react';
import {View, Image, Pressable} from 'react-native';
import {groupDetailStyles} from '../styles/groupDetailStyles';
import {Text} from '../../../../shared/ui/typography/Text';
import {dummyProfile, Eye} from '@shared/assets/images';

interface GroupAuthorInfoProps {
  category: string | number;
  authorName: string;
  date: string;
  viewCounts: number;
  avatarUrl: string | null;
  userId: number;
  onAuthorPress?: (userId: number) => void;
  categoryBgColor?: string; // 카테고리 배지 배경색
  categoryTextColor?: string; // 카테고리 텍스트 색상
}

/**
 * ISO 형식 날짜 문자열을 "YYYY.MM.DD HH:MM" 형식으로 변환
 * @param isoDateString ISO 형식 날짜 문자열 (예: "2025-05-22T13:53:52")
 * @returns 포맷팅된 날짜 문자열 (예: "2025.05.22 13:53")
 */
const formatDate = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      return isoDateString; // 유효하지 않은 날짜는 원본 반환
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}`;
  } catch (error) {
    console.error('날짜 변환 오류:', error);
    return isoDateString; // 오류 발생 시 원본 반환
  }
};

/**
 * 모임 작성자 정보 컴포넌트
 */
const GroupAuthorInfo: React.FC<GroupAuthorInfoProps> = ({
  category,
  authorName,
  date,
  viewCounts,
  avatarUrl,
  userId,
  onAuthorPress,
  categoryBgColor = '#DEE9FC', // 기본 배경색
  categoryTextColor = '#263FA9', // 기본 텍스트 색상
}) => {
  // 날짜 형식 변환
  const formattedDate = formatDate(date);

  // 작성자 프로필 클릭 핸들러
  const handleAuthorPress = () => {
    if (onAuthorPress) {
      onAuthorPress(userId);
    }
  };

  return (
    <View style={groupDetailStyles.authorContainer}>
      <View
        style={[
          groupDetailStyles.categoryBadge,
          {backgroundColor: categoryBgColor},
        ]}>
        <Text
          variant="caption"
          style={[groupDetailStyles.categoryText, {color: categoryTextColor}]}>
          {category}
        </Text>
      </View>
      <View style={groupDetailStyles.authorInfoContainer}>
        <Pressable
          onPress={handleAuthorPress}
          style={({pressed}) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            },
          ]}>
          {avatarUrl ? (
            <Image
              source={{uri: avatarUrl || dummyProfile}}
              resizeMode={'stretch'}
              style={groupDetailStyles.authorAvatar}
            />
          ) : (
            <Image
              source={dummyProfile}
              resizeMode={'stretch'}
              style={groupDetailStyles.authorAvatar}
            />
          )}
          <View style={groupDetailStyles.authorTextContainer}>
            <Text
              variant="subtitle2"
              weight="medium"
              style={groupDetailStyles.authorName}>
              {authorName}
            </Text>
            <Text
              variant="caption"
              color="#757575"
              style={groupDetailStyles.authorDate}>
              {formattedDate}
            </Text>
          </View>
        </Pressable>
        <View style={groupDetailStyles.likeContainer}>
          <Eye style={groupDetailStyles.likeIcon} />
          <Text variant="body2" style={groupDetailStyles.likeCount}>
            {viewCounts}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default GroupAuthorInfo;
