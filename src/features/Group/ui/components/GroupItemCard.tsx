import React from 'react';
import {View, Image, TouchableOpacity} from 'react-native';
import {GroupItemProps} from '../../model/types';
import {commonStyles, groupListStyles} from '../styles/groupStyles';
import {Text} from '../../../../shared/ui/typography/Text';
import {Eye, Heart, Users} from '@shared/assets/images';

/**
 * 모임 아이템 카드 컴포넌트
 * - 이미지가 있는 경우와 없는 경우 다른 레이아웃 사용
 */
export const GroupItemCard: React.FC<GroupItemProps> = ({item, onPress}) => {
  // 이미지가 있는 경우와 없는 경우 다른 레이아웃 사용
  if (item.image) {
    return (
      <TouchableOpacity onPress={() => onPress(item.id)} activeOpacity={0.7}>
        <View style={groupListStyles.itemContainer}>
          <View style={groupListStyles.itemHeader}>
            <View
              style={[
                groupListStyles.categoryBadge,
                {backgroundColor: item.categoryColor},
              ]}>
              <Text
                variant="caption"
                color={item.categoryTextColor}
                style={groupListStyles.categoryText}>
                {item.category}
              </Text>
            </View>
            <View style={groupListStyles.likesContainer}>
              <Eye style={groupListStyles.likeIcon} />
              <Text variant="body2" style={groupListStyles.likesText}>
                {item.viewCounts}
              </Text>
            </View>
          </View>
          <View style={groupListStyles.itemContent}>
            <View style={groupListStyles.textContainer}>
              <Text
                variant="subtitle1"
                weight="medium"
                style={groupListStyles.title}>
                {item.title}
              </Text>
              <Text variant="body2" style={groupListStyles.description}>
                {item.description}
              </Text>
              <View style={groupListStyles.metaContainer}>
                <View style={groupListStyles.metaItem}>
                  <Heart style={groupListStyles.metaIcon} />
                  <Text variant="caption" style={groupListStyles.metaText}>
                    {item.likes}
                  </Text>
                </View>
                <View style={groupListStyles.metaItem}>
                  <Users style={groupListStyles.metaIcon} />
                  <Text variant="caption" style={groupListStyles.metaText}>
                    {item.participants}
                  </Text>
                </View>
                <Text variant="caption" style={groupListStyles.metaText}>
                  {item.time}
                </Text>
              </View>
            </View>
            {item.image && (
              <Image
                source={{uri: item.image}}
                resizeMode={'stretch'}
                style={groupListStyles.itemImage}
              />
            )}
          </View>
        </View>
        <View style={commonStyles.divider} />
      </TouchableOpacity>
    );
  } else {
    // 이미지가 없는 레이아웃
    return (
      <TouchableOpacity onPress={() => onPress(item.id)} activeOpacity={0.7}>
        <View style={groupListStyles.itemContainerNoImage}>
          <View style={groupListStyles.itemHeader}>
            <View
              style={[
                groupListStyles.categoryBadge,
                {backgroundColor: item.categoryColor},
              ]}>
              <Text
                variant="caption"
                color={item.categoryTextColor}
                style={[
                  groupListStyles.categoryText,
                  {color: item.categoryTextColor},
                ]}>
                {item.category}
              </Text>
            </View>
            <View style={groupListStyles.likesContainer}>
              <Eye style={groupListStyles.likeIcon} />
              <Text variant="body2" style={groupListStyles.likesText}>
                {item.viewCounts}
              </Text>
            </View>
          </View>
          <View style={groupListStyles.itemContentNoImage}>
            <Text
              variant="subtitle1"
              weight="medium"
              style={groupListStyles.title}>
              {item.title}
            </Text>
            <Text variant="body2" style={groupListStyles.description}>
              {item.description}
            </Text>
            <View style={groupListStyles.metaContainer}>
              <View style={groupListStyles.metaItem}>
                <Heart style={groupListStyles.metaIcon} />
                <Text variant="caption" style={groupListStyles.metaText}>
                  {item.likes}
                </Text>
              </View>
              <View style={groupListStyles.metaItem}>
                <Users style={groupListStyles.metaIcon} />
                <Text variant="caption" style={groupListStyles.metaText}>
                  {item.participants}
                </Text>
              </View>
              <Text variant="caption" style={groupListStyles.metaText}>
                {item.time}
              </Text>
            </View>
          </View>
        </View>
        <View style={commonStyles.divider} />
      </TouchableOpacity>
    );
  }
};
