// src/features/Profile/ui/UserLikedGroupsScreen.tsx
import React from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import {LikedGroupCard} from './components/LikedGroupCard';
import {useUserLikes} from '../model/useProfile';
import {styles} from './styles/LikedGroups.styles';

export const UserLikedGroupsScreen = ({route}: any) => {
  const {userId} = route.params;
  const {posts, isLoading: isLikesLoading, isError} = useUserLikes(userId);

  if (isLikesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            좋아요 목록을 불러오고 있습니다...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>🔒</Text>
          <Text style={styles.errorTitle}>비공개로 설정되어 있어요</Text>
          <Text style={styles.errorText}>
            이 사용자는 좋아요 목록을 비공개로 설정했어요.{'\n'}
            다른 정보를 확인해보세요! 😊
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const likedGroupsData = posts.map((post: any) => ({
    id: post.postId.toString(),
    title: post.title,
    content: post.content,
    likeCount: post.likeCount,
    currentParticipants: post.currentParticipants,
    maxParticipants: post.maxParticipants,
    createdAt: post.createdAt,
    thumbnailUrl: post.thumbnailUrl,
    viewCount: post.viewCount,
    categoryId: post.categoryId,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={likedGroupsData}
        keyExtractor={item => item.id}
        renderItem={({item}) => <LikedGroupCard item={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};
