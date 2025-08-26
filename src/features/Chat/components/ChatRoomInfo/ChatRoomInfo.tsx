import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Text} from '../../../../shared/ui/typography/Text';
import {Bell, Exit, Mail, Pen} from '@shared/assets/images';
import {ChatRoomInfoProps} from './types';
import MemberItem from './components/MemberItem';
import {secureStorage} from '@shared/lib/security';
import {useCheckMeetingParticipation} from '../../api/hooks';
import {useGroupDetail} from '../../../Group/api/hooks';

const ChatRoomInfo: React.FC<ChatRoomInfoProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roomName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roomIcon,
  memberCount,
  category: propCategory,
  postTitle: propPostTitle,
  isDirectMessage = false, // 기본값 설정
  members,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClose,
  onLeaveRoom,
  isNotificationEnabled = true,
  onNotificationToggle,
  meetingId,
  postId,
  navigation,
  onInvite,
}) => {
  const {t} = useTranslation();
  const [_currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isCurrentUserHost, setIsCurrentUserHost] = useState(false);
  const [otherUserId, setOtherUserId] = useState<number | null>(null);

  // 모임 상세 정보 가져오기 (postId가 있으면 게시글에서, meetingId가 있으면 모임에서)
  const {data: groupDetailData} = useGroupDetail(postId || 0, {
    enabled: !!postId && postId > 0,
  });

  // 상대방의 모임 참가 여부 확인
  const {data: participationData} = useCheckMeetingParticipation(
    meetingId || 0,
    otherUserId || 0,
    // DM 채팅방이고, 호스트이고, 상대방 사용자 ID가 있고, meetingId가 있을 때만 쿼리 실행
    isDirectMessage &&
      isCurrentUserHost &&
      !!otherUserId &&
      !!meetingId &&
      meetingId > 0 &&
      otherUserId > 0,
  );

  // 제목과 카테고리 처리 - API에서 가져온 데이터 우선 사용
  const category = propCategory || '공부';
  const postTitle =
    groupDetailData?.data?.post?.title || propPostTitle || '모임 정보';

  // 디버깅: API 응답 확인
  console.log('🔍 ChatRoomInfo API 데이터:', {
    postId,
    meetingId,
    groupDetailData,
    apiTitle: groupDetailData?.data?.post?.title,
    propTitle: propPostTitle,
    finalTitle: postTitle,
  });

  // 디버깅용 로그
  console.log('🔍 ChatRoomInfo 초대 버튼 표시 조건:', {
    isDirectMessage,
    isCurrentUserHost,
    otherUserId,
    meetingId,
    isParticipating: participationData?.data?.isParticipating,
    shouldShowInviteButton:
      isDirectMessage &&
      isCurrentUserHost &&
      !participationData?.data?.isParticipating,
  });

  // 현재 사용자 ID 가져오고 호스트 여부 확인
  useEffect(() => {
    let isMounted = true;

    const checkCurrentUserHost = async () => {
      try {
        const userId = await secureStorage.getUserId();

        if (!isMounted) return;

        setCurrentUserId(userId);

        if (userId) {
          // members 배열에서 현재 사용자를 찾아 호스트 여부 확인
          const currentUserMember = members.find(
            member => member.id === userId.toString(),
          );

          if (!isMounted) return;

          setIsCurrentUserHost(currentUserMember?.isHost || false);

          // DM 채팅방인 경우 상대방 사용자 ID 찾기
          if (isDirectMessage) {
            const otherUser = members.find(
              member => member.id !== userId.toString(),
            );
            if (otherUser && isMounted) {
              setOtherUserId(parseInt(otherUser.id, 10));
            }
          }
        }
      } catch (error) {
        console.error('사용자 정보 확인 오류:', error);
      }
    };

    checkCurrentUserHost();

    return () => {
      isMounted = false;
    };
  }, [members, isDirectMessage]);

  const handleToggleNotification = () => {
    if (onNotificationToggle) {
      onNotificationToggle();
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      t('messages.chatInfo.leaveChat'),
      t('messages.chatInfo.leaveConfirm'),
      [
        {
          text: t('messages.chatInfo.cancel'),
          style: 'cancel',
        },
        {
          text: t('messages.chatInfo.confirm'),
          onPress: onLeaveRoom,
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const handleGoToPost = () => {
    const targetPostId = postId || meetingId;
    if (targetPostId && navigation) {
      console.log('게시글로 이동:', targetPostId);
      navigation.navigate('GroupDetail', {
        postId: targetPostId,
      });
    } else {
      console.warn('postId/meetingId 또는 navigation이 없습니다:', {
        postId,
        meetingId,
        navigation,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* 모든 채팅방에서 카테고리 표시 */}
        <TouchableOpacity style={styles.categoryButton} onPress={() => {}}>
          <Text variant="body1" weight="bold" color="#263FA9">
            {category}
          </Text>
        </TouchableOpacity>

        {/* 모든 채팅방에서 제목 표시 */}
        <Text
          variant="body1"
          weight="bold"
          color="#303030"
          style={styles.titleText}>
          {postTitle}
        </Text>

        {/* 모든 채팅방에서 게시글 이동 버튼 표시 */}
        <TouchableOpacity style={styles.postButton} onPress={handleGoToPost}>
          <Text variant="body1" weight="bold" color="#9DA2AF">
            {t('messages.chatInfo.goToPost')}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}></View>

        <View style={styles.menuContainer}>
          <View style={styles.menuItem}>
            <Bell style={styles.menuIcon} />
            <Text variant="body2" color="#303030" style={styles.menuText}>
              {t('messages.chatInfo.notification')}
            </Text>
            <Switch
              trackColor={{false: '#D1D5DB', true: '#1CBFDC'}}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#D1D5DB"
              onValueChange={handleToggleNotification}
              value={isNotificationEnabled}
            />
          </View>

          {/* DM 채팅방이고 호스트이고 상대방이 아직 참가하지 않았을 때만 초대 메뉴 표시 */}
          {isDirectMessage &&
            isCurrentUserHost &&
            !participationData?.data?.isParticipating && (
              <View style={styles.menuItem}>
                <Mail style={styles.menuIcon} />
                <Text variant="body2" color="#303030" style={styles.menuText}>
                  {t('messages.chatInfo.invite')}
                </Text>
                <TouchableOpacity
                  style={styles.inviteButton}
                  onPress={onInvite}>
                  <Text variant="caption" weight="bold" color="#F9FAFB">
                    {t('messages.chatInfo.inviteButton')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* 호스트만 수정 메뉴 표시 */}
          {isCurrentUserHost && (
            <View style={styles.menuItem}>
              <Pen style={styles.menuIcon} />
              <Text variant="body2" color="#303030" style={styles.menuText}>
                {t('messages.chatInfo.editPost')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider}></View>

        <Text
          variant="subtitle2"
          weight="bold"
          color="#303030"
          style={styles.sectionTitle}>
          {t('messages.chatInfo.participants')} {memberCount}
        </Text>

        <View style={styles.membersList}>
          {members.map(member => (
            <MemberItem key={member.id} member={member} />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveRoom}>
          <Exit style={styles.leaveIcon} />
          <Text variant="body2" weight="medium" color="#111827">
            {t('messages.chatInfo.leave')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '75%',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  categoryButton: {
    backgroundColor: '#DEE9FC',
    borderRadius: 4,
    paddingVertical: 1,
    paddingHorizontal: 11,
    marginTop: 70,
    marginBottom: 11,
    marginLeft: 25,
    alignSelf: 'flex-start',
  },
  titleText: {
    fontSize: 16,
    marginBottom: 11,
    marginLeft: 25,
  },
  postButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D2D5DB',
    borderRadius: 4,
    borderWidth: 1,
    paddingVertical: 5,
    marginBottom: 18,
    marginHorizontal: 25,
  },
  divider: {
    height: 1,
    backgroundColor: '#D2D5DB',
    marginBottom: 17,
    marginHorizontal: 25,
  },
  menuContainer: {
    alignItems: 'flex-start',
    marginBottom: 18,
    marginHorizontal: 25,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    width: '100%',
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 14,
  },
  menuText: {
    fontSize: 14,
    flex: 1,
  },
  toggleContainer: {
    // 이 스타일이 더 이상 필요하지 않을 수 있습니다
  },
  toggleIcon: {
    // 이 스타일이 더 이상 필요하지 않을 수 있습니다
  },
  inviteButton: {
    backgroundColor: '#1CBFDC',
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 11,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 20,
    marginLeft: 27,
  },
  membersList: {
    paddingHorizontal: 25,
    marginBottom: 40,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#D2D5DB',
    paddingVertical: 12,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  leaveIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
});

export default ChatRoomInfo;
