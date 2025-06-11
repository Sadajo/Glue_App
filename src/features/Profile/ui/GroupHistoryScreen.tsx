// src/features/Profile/ui/GroupHistoryScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, FlatList, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { GroupHistoryCard } from './components/GroupHistoryCard';
import { useMeetingsHistory } from '../model/useProfile';
import { useProfileMe } from '../model/useProfileMe';
import { styles } from './styles/GroupHistory.styles';

export const GroupHistoryScreen = () => {
  const { data: profileData, isLoading: isProfileLoading } = useProfileMe();
  const { hostedMeetings, joinedMeetings, isLoading: isHistoryLoading, isError } = useMeetingsHistory(profileData?.userId || 0);
  const [activeTab, setActiveTab] = useState<'hosted' | 'joined'>('hosted');

  if (isProfileLoading || isHistoryLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>모임 히스토리를 불러오고 있습니다...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>모임 히스토리를 불러오는데 실패했습니다.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentData = activeTab === 'hosted' ? hostedMeetings : joinedMeetings;
  
  const historyData = currentData.map((meeting: any) => ({
    id: meeting.postId.toString(),
    title: meeting.meetingTitle,
    thumbnail: meeting.meetingThumbnail,
    categoryId: meeting.categoryId,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hosted' && styles.activeTab]}
          onPress={() => setActiveTab('hosted')}
        >
          <Text style={[styles.tabText, activeTab === 'hosted' && styles.activeTabText]}>
            주최한 모임 ({hostedMeetings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'joined' && styles.activeTab]}
          onPress={() => setActiveTab('joined')}
        >
          <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>
            참여한 모임 ({joinedMeetings.length})
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={historyData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <GroupHistoryCard item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};