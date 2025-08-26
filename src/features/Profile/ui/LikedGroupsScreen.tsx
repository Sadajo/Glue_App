// src/features/Profile/ui/LikedGroupsScreen.tsx
import React from 'react';
import { SafeAreaView, FlatList, View, Text, ActivityIndicator } from 'react-native';
import { LikedGroupCard } from './components/LikedGroupCard';
import { useUserLikes } from '../model/useProfile';
import { useProfileMe } from '../model/useProfileMe';
import { styles } from './styles/LikedGroups.styles';

export const LikedGroupsScreen = () => {
  const { data: profileData, isLoading: isProfileLoading } = useProfileMe();
  const { posts, isLoading: isLikesLoading, isError } = useUserLikes(profileData?.userId || 0);

  if (isProfileLoading || isLikesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>좋아요 목록을 불러오고 있습니다...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>좋아요 목록을 불러오는데 실패했습니다.</Text>
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
        renderItem={({ item }) => <LikedGroupCard item={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};