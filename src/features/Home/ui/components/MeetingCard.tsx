import React from 'react';
import {View, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {MeetingCardProps} from '../../model/types';
import {Text} from '../../../../shared/ui/typography/Text';
import {Eye, Heart, Users} from '@shared/assets/images';
import {useNavigation} from '@react-navigation/native';
const MeetingCard = ({
  category,
  categoryColor,
  categoryBgColor,
  date,
  author,
  authorImage,
  viewCount,
  title,
  description,
  likeCount,
  memberCount,
}: MeetingCardProps) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        (navigation as any).navigate('Group', {
          screen: 'GroupDetail',
          params: {
            // id: card.id,
            // title: card.title,
            // data: card,
          },
        })
      }>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryTag, {backgroundColor: categoryBgColor}]}>
          <Text
            variant="caption"
            color={categoryColor}
            weight="bold"
            style={styles.categoryText}>
            {category}
          </Text>
        </View>
        <View style={styles.flex1}></View>
        <Text variant="caption" color="#9DA2AF" style={styles.dateText}>
          {date}
        </Text>
      </View>
      <View style={styles.authorRow}>
        <View style={styles.authorInfo}>
          <Image
            source={{uri: authorImage}}
            resizeMode={'stretch'}
            style={styles.authorImage}
          />
          <Text
            variant="caption"
            color="#384050"
            weight="bold"
            style={styles.authorName}>
            {author}
          </Text>
        </View>
        <View style={styles.flex1}></View>
        <View style={styles.viewCountContainer}>
          <Eye style={styles.smallIcon} />
          <Text variant="caption" color="#9DA2AF" style={styles.metaText}>
            {viewCount}
          </Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTextContainer}>
          <Text
            variant="subtitle1"
            color="#303030"
            weight="bold"
            style={styles.cardTitle}>
            {title}
          </Text>
          <Text variant="body2" color="#303030" style={styles.cardDescription}>
            {description}
          </Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Heart style={styles.smallIcon} />
            <Text variant="caption" color="#384050" style={styles.metaInfoText}>
              {likeCount}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Users style={styles.smallIcon} />
            <Text variant="caption" color="#384050" style={styles.metaInfoText}>
              {memberCount}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#0000000D',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 4,
    elevation: 4,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  categoryTag: {
    borderRadius: 4,
    paddingHorizontal: 5,
  },
  categoryText: {
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorImage: {
    width: 24,
    height: 24,
    marginRight: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#D3D5DB',
  },
  authorName: {
    fontSize: 12,
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
  },
  cardContent: {
    alignItems: 'flex-start',
    width: '100%',
  },
  cardTextContainer: {
    marginBottom: 11,
    width: '100%',
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    width: '100%',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaInfoText: {
    fontSize: 12,
  },
  flex1: {
    flex: 1,
  },
});

export default MeetingCard;
