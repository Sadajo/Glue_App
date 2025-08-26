// src/features/Profile/ui/UserParticipatingMeetingsScreen.tsx
import React, {useState} from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useMeetingsHistory} from '../model/useProfile';
import {useNavigation} from '@react-navigation/native';
import {styles} from './styles/MyParticipatingMeetings.styles';

interface MeetingItemProps {
  item: {
    meetingId: number;
    meetingTitle: string;
    meetingImageUrl: string;
    currentParticipants: number;
  };
}

const MeetingItem: React.FC<MeetingItemProps> = ({item}) => {
  const navigation = useNavigation<any>();
  const defaultImage = require('@shared/assets/images/default-image.png');

  const handlePress = () => {
    navigation.navigate('GroupDetail', {postId: item.meetingId});
  };

  return (
    <TouchableOpacity style={styles.meetingCard} onPress={handlePress}>
      <Image
        source={
          item.meetingImageUrl ? {uri: item.meetingImageUrl} : defaultImage
        }
        style={styles.meetingImage}
        resizeMode="cover"
      />
      <View style={styles.meetingInfo}>
        <Text style={styles.meetingTitle} numberOfLines={2}>
          {item.meetingTitle}
        </Text>
        <Text style={styles.participantCount}>
          참여자 {item.currentParticipants}명
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const UserParticipatingMeetingsScreen = ({route}: any) => {
  const {userId} = route.params;
  const {hostedMeetings, joinedMeetings, isLoading, isError} =
    useMeetingsHistory(userId);
  const [activeTab, setActiveTab] = useState<'hosted' | 'joined'>('hosted');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            참여 중인 모임을 불러오고 있습니다...
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
            이 사용자는 참여 중인 모임을 비공개로 설정했어요.{'\n'}
            다른 정보를 확인해보세요! 😊
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentData = activeTab === 'hosted' ? hostedMeetings : joinedMeetings;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'hosted' && styles.activeTab]}
          onPress={() => setActiveTab('hosted')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'hosted' && styles.activeTabText,
            ]}>
            주최한 모임 ({hostedMeetings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'joined' && styles.activeTab]}
          onPress={() => setActiveTab('joined')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'joined' && styles.activeTabText,
            ]}>
            참여한 모임 ({joinedMeetings.length})
          </Text>
        </TouchableOpacity>
      </View>

      {currentData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {activeTab === 'hosted'
              ? '주최한 모임이 없습니다.'
              : '참여한 모임이 없습니다.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={item => item.meetingId.toString()}
          renderItem={({item}) => <MeetingItem item={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
    </SafeAreaView>
  );
};
