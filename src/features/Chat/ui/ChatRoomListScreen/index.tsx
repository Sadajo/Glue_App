import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {styles} from './styles';
import {ChatRoom} from '../../entities/types';
import {TabHeader, MessageFilter} from '../../components';
import {useTranslation} from 'react-i18next';
import {formatInvitationMessageForDisplay} from '../../lib/invitationUtils';
import {dummyProfile} from '@shared/assets/images';
import {
  useHostedDmRooms,
  useParticipatedDmRooms,
  useGroupChatRooms,
} from '../../api/hooks';
import {DmChatRoom, GroupChatRoom} from '../../api/api';
import {toastService} from '@shared/lib/notifications/toast';
import {secureStorage} from '@shared/lib/security';
import {webSocketService, ChatRoomListUpdateDto} from '../../lib/websocket';
import {formatKSTTime, convertUTCToKST} from '../../lib/timeUtils';

interface ChatRoomListScreenProps {
  chatRooms: ChatRoom[]; // 이제 사용하지 않지만 하위 호환성을 위해 유지
  onGroupChatRoomPress?: (groupChatroomId: number) => void;
  onDmChatRoomPress?: (dmRoomId: number) => void;
  navigation?: any; // React Navigation 객체
}

type FilterType = 'host' | 'guest' | 'all';

const ChatRoomListScreen: React.FC<ChatRoomListScreenProps> = ({
  chatRooms: _chatRooms,
  onGroupChatRoomPress,
  onDmChatRoomPress,
  navigation,
}) => {
  const {t} = useTranslation();
  const [activeTab, setActiveTab] = useState<'chat' | 'message'>('chat');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [directMessages, setDirectMessages] = useState<DmChatRoom[]>([]);
  const [groupChatRooms, setGroupChatRooms] = useState<GroupChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 호스트 DM 채팅방 목록 조회 훅
  const {
    data: hostedDmRooms,
    isLoading: isHostedLoading,
    isError: isHostedError,
    error: hostedError,
    refetch: refetchHostedRooms,
  } = useHostedDmRooms();

  // 참여자 DM 채팅방 목록 조회 훅
  const {
    data: participatedDmRooms,
    isLoading: isParticipatedLoading,
    isError: isParticipatedError,
    error: participatedError,
    refetch: refetchParticipatedRooms,
  } = useParticipatedDmRooms();

  // 그룹 채팅방 목록 조회 훅
  const {
    data: groupChatRoomsData,
    isLoading: isGroupChatRoomsLoading,
    isError: isGroupChatRoomsError,
    error: groupChatRoomsError,
    refetch: refetchGroupChatRooms,
  } = useGroupChatRooms();

  // 모든 채팅방 데이터 로딩 상태
  useEffect(() => {
    setIsLoading(
      isHostedLoading || isParticipatedLoading || isGroupChatRoomsLoading,
    );
  }, [isHostedLoading, isParticipatedLoading, isGroupChatRoomsLoading]);

  // 새로고침 상태
  const [refreshing, setRefreshing] = useState(false);

  // 채팅방 리스트 업데이트 핸들러
  const handleChatRoomListUpdate = useCallback(
    (update: ChatRoomListUpdateDto) => {
      console.log('[ChatRoomListScreen] 채팅방 리스트 업데이트 수신:', update);

      if (update.chatRoomType === 'DM') {
        // DM 채팅방 업데이트
        setDirectMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const existingIndex = updatedMessages.findIndex(
            room => room.dmChatRoomId === update.chatRoomId,
          );

          if (existingIndex !== -1) {
            // 기존 항목 업데이트
            updatedMessages[existingIndex] = {
              ...updatedMessages[existingIndex],
              lastMessage: update.lastMessage,
              lastMessageTime: update.lastMessageTime,
              hasUnreadMessages: update.hasUnreadMessages,
            };
          } else if (update.otherUser) {
            // 새로운 DM 채팅방 추가
            const newRoom: DmChatRoom = {
              dmChatRoomId: update.chatRoomId,
              meetingId: 0, // 기본값
              otherUser: {
                userId: update.otherUser.userId,
                userName: update.otherUser.nickname,
                profileImageUrl: update.otherUser.profileImageUrl,
              },
              lastMessage: update.lastMessage,
              lastMessageTime: update.lastMessageTime,
              hasUnreadMessages: update.hasUnreadMessages,
            };
            updatedMessages.unshift(newRoom);
          }

          // 최신 메시지 시간 기준으로 정렬 (KST 기준)
          return updatedMessages.sort((a, b) => {
            const timeA = a.lastMessageTime
              ? convertUTCToKST(a.lastMessageTime)?.getTime() || 0
              : 0;
            const timeB = b.lastMessageTime
              ? convertUTCToKST(b.lastMessageTime)?.getTime() || 0
              : 0;
            return timeB - timeA;
          });
        });
      } else if (update.chatRoomType === 'GROUP') {
        // 그룹 채팅방 업데이트
        setGroupChatRooms(prevRooms => {
          const updatedRooms = [...prevRooms];
          const existingIndex = updatedRooms.findIndex(
            room => room.groupChatroomId === update.chatRoomId,
          );

          if (existingIndex !== -1) {
            // 기존 항목 업데이트
            updatedRooms[existingIndex] = {
              ...updatedRooms[existingIndex],
              lastMessage: update.lastMessage,
              lastMessageTime: update.lastMessageTime,
              hasUnreadMessages: update.hasUnreadMessages,
            };
          } else if (update.meeting) {
            // 새로운 그룹 채팅방 추가
            const newRoom: GroupChatRoom = {
              groupChatroomId: update.chatRoomId,
              meeting: {
                meetingId: update.meeting.meetingId,
                meetingTitle: update.meeting.meetingTitle,
                meetingImageUrl: update.meeting.meetingImageUrl,
                currentParticipants: update.meeting.currentParticipants,
              },
              lastMessage: update.lastMessage,
              lastMessageTime: update.lastMessageTime,
              hasUnreadMessages: update.hasUnreadMessages,
            };
            updatedRooms.unshift(newRoom);
          }

          // 최신 메시지 시간 기준으로 정렬 (KST 기준)
          return updatedRooms.sort((a, b) => {
            const timeA = a.lastMessageTime
              ? convertUTCToKST(a.lastMessageTime)?.getTime() || 0
              : 0;
            const timeB = b.lastMessageTime
              ? convertUTCToKST(b.lastMessageTime)?.getTime() || 0
              : 0;
            return timeB - timeA;
          });
        });
      }
    },
    [],
  );

  // 현재 사용자 ID 초기화 및 WebSocket 연결
  useEffect(() => {
    const initCurrentUser = async () => {
      try {
        const userId = await secureStorage.getUserId();
        setCurrentUserId(userId);
        console.log('[ChatRoomListScreen] 현재 사용자 ID:', userId);

        // WebSocket 연결
        if (userId && !webSocketService.isConnected()) {
          const connected = await webSocketService.connectWebSocket(userId);
          if (connected) {
            console.log('[ChatRoomListScreen] WebSocket 연결 성공');
            // 채팅방 리스트 업데이트 리스너 등록
            webSocketService.setChatRoomListUpdateListener(
              handleChatRoomListUpdate,
            );
          } else {
            console.error('[ChatRoomListScreen] WebSocket 연결 실패');
          }
        } else if (webSocketService.isConnected()) {
          // 이미 연결된 경우 리스너만 등록
          webSocketService.setChatRoomListUpdateListener(
            handleChatRoomListUpdate,
          );
        }
      } catch (error) {
        console.error(
          '[ChatRoomListScreen] 현재 사용자 ID 가져오기 실패:',
          error,
        );
      }
    };

    initCurrentUser();

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      webSocketService.setChatRoomListUpdateListener(null);
    };
  }, [handleChatRoomListUpdate]);

  // 새로고침 핸들러
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchHostedRooms(),
        refetchParticipatedRooms(),
        refetchGroupChatRooms(),
      ]);
    } catch (error) {
      console.error('새로고침 실패:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchHostedRooms, refetchParticipatedRooms, refetchGroupChatRooms]);

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'message') {
        // 쪽지 탭이 활성화된 상태에서 화면에 포커스될 때만 새로고침
        refetchHostedRooms();
        refetchParticipatedRooms();
      } else if (activeTab === 'chat') {
        // 모임톡 탭이 활성화된 상태에서 화면에 포커스될 때 새로고침
        refetchGroupChatRooms();
      }
    }, [
      activeTab,
      refetchHostedRooms,
      refetchParticipatedRooms,
      refetchGroupChatRooms,
    ]),
  );

  // 에러 발생시 토스트 표시
  useEffect(() => {
    if (isHostedError && hostedError) {
      toastService.error('오류', hostedError.message);
    }
    if (isParticipatedError && participatedError) {
      toastService.error('오류', participatedError.message);
    }
    if (isGroupChatRoomsError && groupChatRoomsError) {
      toastService.error('오류', groupChatRoomsError.message);
    }
  }, [
    isHostedError,
    hostedError,
    isParticipatedError,
    participatedError,
    isGroupChatRoomsError,
    groupChatRoomsError,
  ]);

  // 필터에 따라 DM 채팅방 목록 업데이트
  useEffect(() => {
    if (activeTab === 'message') {
      let filteredMessages: DmChatRoom[] = [];

      if (activeFilter === 'host' && hostedDmRooms?.data) {
        filteredMessages = hostedDmRooms.data;
      } else if (activeFilter === 'guest' && participatedDmRooms?.data) {
        filteredMessages = participatedDmRooms.data;
      } else {
        // 'all' 필터인 경우 모든 채팅방 병합
        const allMessages = [
          ...(hostedDmRooms?.data || []),
          ...(participatedDmRooms?.data || []),
        ];

        // dmChatRoomId로 중복 제거 (호스트/참여자 모두 포함된 채팅방이 있을 수 있음)
        const uniqueRooms = allMessages.reduce((acc, current) => {
          const duplicateIndex = acc.findIndex(
            item => item.dmChatRoomId === current.dmChatRoomId,
          );
          if (duplicateIndex === -1) {
            acc.push(current);
          }
          return acc;
        }, [] as DmChatRoom[]);

        filteredMessages = uniqueRooms;
      }

      // 최신 메시지 순으로 정렬 (KST 기준)
      filteredMessages.sort((a, b) => {
        // lastMessageTime이 null인 경우 가장 아래로
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;

        const timeA = convertUTCToKST(a.lastMessageTime)?.getTime() || 0;
        const timeB = convertUTCToKST(b.lastMessageTime)?.getTime() || 0;
        return timeB - timeA;
      });

      setDirectMessages(filteredMessages);
    }
  }, [activeTab, activeFilter, hostedDmRooms, participatedDmRooms]);

  // 그룹 채팅방 데이터 업데이트
  useEffect(() => {
    if (activeTab === 'chat' && groupChatRoomsData?.data) {
      // 최신 메시지 순으로 정렬 (KST 기준)
      const sortedGroupChats = [...groupChatRoomsData.data].sort((a, b) => {
        // lastMessageTime이 null인 경우 가장 아래로
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;

        const timeA = convertUTCToKST(a.lastMessageTime)?.getTime() || 0;
        const timeB = convertUTCToKST(b.lastMessageTime)?.getTime() || 0;
        return timeB - timeA;
      });

      setGroupChatRooms(sortedGroupChats);
    }
  }, [activeTab, groupChatRoomsData]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'chat' | 'message') => {
    setActiveTab(tab);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  // DM 채팅방 클릭 핸들러
  const handleDmChatRoomPress = (dmRoomId: number) => {
    console.log('[ChatRoomList] DM 채팅방 클릭됨:', dmRoomId);

    // 메시지 읽음 처리
    if (currentUserId && webSocketService.isConnected()) {
      webSocketService.sendDmReadMessage(dmRoomId, currentUserId);
    }

    if (onDmChatRoomPress) {
      onDmChatRoomPress(dmRoomId);
    } else {
      console.warn('[ChatRoomList] onDmChatRoomPress 콜백이 없습니다.');
    }
  };

  // 그룹 채팅방 클릭 핸들러
  const handleGroupChatRoomPress = (groupChatroomId: number) => {
    console.log('[ChatRoomList] 그룹 채팅방 클릭됨:', groupChatroomId);

    // 메시지 읽음 처리
    if (currentUserId && webSocketService.isConnected()) {
      webSocketService.sendGroupReadMessage(groupChatroomId, currentUserId);
    }

    // 해당 그룹 채팅방 정보 찾기
    const selectedRoom = groupChatRooms.find(
      room => room.groupChatroomId === groupChatroomId,
    );
    const meetingTitle = selectedRoom?.meeting?.meetingTitle || '모임톡';

    // 네비게이션이 있으면 직접 GroupChatRoomScreen으로 이동
    if (navigation) {
      navigation.navigate('GroupChatRoomScreen', {
        groupChatroomId: groupChatroomId,
        meetingTitle: meetingTitle,
      });
    } else if (onGroupChatRoomPress) {
      // 네비게이션이 없으면 기존 콜백 사용
      onGroupChatRoomPress(groupChatroomId);
    } else {
      console.warn(
        '[ChatRoomList] navigation과 onGroupChatRoomPress 콜백이 모두 없습니다.',
      );
    }
  };

  // 기존 formatSafeTime 함수를 formatKSTTime으로 교체
  // formatKSTTime은 timeUtils에서 import되어 사용됨

  // 초대장 메시지를 읽기 쉬운 형태로 변환하는 함수
  const formatLastMessage = (lastMessage: string | null) => {
    if (!lastMessage) return null; // null 반환으로 상위에서 기본값 처리하도록

    // [INVITATION] 접두사가 있는 초대장 메시지인지 확인
    if (lastMessage.startsWith('[INVITATION]')) {
      return formatInvitationMessageForDisplay(
        lastMessage,
        t('invitation.shortMessageDefault'),
      );
    }

    // 일반 메시지는 그대로 반환
    return lastMessage;
  };

  // 읽지 않음 표시 여부를 결정하는 함수
  const shouldShowUnreadIndicator = (room: DmChatRoom | GroupChatRoom) => {
    // hasUnreadMessages가 false면 표시하지 않음
    if (!room.hasUnreadMessages) {
      return false;
    }

    // 현재 사용자 ID가 없으면 API 응답 그대로 사용
    if (!currentUserId) {
      return room.hasUnreadMessages;
    }

    // 마지막 메시지가 없으면 표시하지 않음
    if (!room.lastMessage) {
      return false;
    }

    // DM 채팅방의 경우: 내가 호스트이고 마지막 메시지 시간이 있으면
    // 내가 보낸 메시지일 가능성이 높으므로 표시하지 않음
    if ('otherUser' in room) {
      // 마지막 메시지가 초대장인 경우는 시스템 메시지이므로 표시
      if (room.lastMessage?.startsWith('[INVITATION]')) {
        return room.hasUnreadMessages;
      }

      // 다른 로직으로 판단하기 어려우므로 일단 API 응답 그대로 사용
      // TODO: API에서 lastMessageSenderId 제공 시 정확한 판단 가능
      return room.hasUnreadMessages;
    }

    // 그룹 채팅방의 경우: API 응답 그대로 사용
    // TODO: API에서 lastMessageSenderId 제공 시 정확한 판단 가능
    return room.hasUnreadMessages;
  };

  // DM 채팅방 아이템 렌더링
  const renderDmChatRoomItem = (room: DmChatRoom) => {
    return (
      <TouchableOpacity
        key={room.dmChatRoomId}
        style={styles.directMessageItem}
        onPress={() => handleDmChatRoomPress(room.dmChatRoomId)}
        activeOpacity={0.7}>
        <Image
          source={
            room.otherUser.profileImageUrl &&
            room.otherUser.profileImageUrl.trim() !== ''
              ? {uri: room.otherUser.profileImageUrl}
              : dummyProfile
          }
          resizeMode={'cover'}
          style={styles.profileImage}
        />
        <View style={styles.messageContent}>
          <Text style={styles.senderName}>
            {room.otherUser.userName ||
              (room.otherUser as any).userNickname ||
              t('common.unknownUser')}
          </Text>
          <Text style={styles.messagePreview}>
            {formatLastMessage(room.lastMessage) ||
              t('messages.newChatRoom', {
                defaultValue: '새로운 채팅방이 생성되었습니다.',
              })}
          </Text>
        </View>
        <View style={styles.messageTimeContainer}>
          <Text style={styles.messageTime}>
            {formatKSTTime(room.lastMessageTime)}
          </Text>
          {shouldShowUnreadIndicator(room) && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 그룹 채팅방 아이템 렌더링
  const renderGroupChatRoomItem = (room: GroupChatRoom) => {
    return (
      <TouchableOpacity
        key={room.groupChatroomId}
        style={styles.directMessageItem}
        onPress={() => handleGroupChatRoomPress(room.groupChatroomId)}
        activeOpacity={0.7}>
        <Image
          source={
            room.meeting.meetingImageUrl &&
            room.meeting.meetingImageUrl.trim() !== ''
              ? {uri: room.meeting.meetingImageUrl}
              : dummyProfile
          }
          resizeMode={'cover'}
          style={styles.profileImage}
        />
        <View style={styles.messageContent}>
          <Text style={styles.senderName}>
            {room.meeting.meetingTitle ||
              t('group.unknownGroup', {defaultValue: '알 수 없는 모임'})}
          </Text>
          <Text style={styles.messagePreview}>
            {formatLastMessage(room.lastMessage) ||
              t('messages.newGroupChat', {
                defaultValue: '새로운 모임톡이 시작되었습니다.',
              })}
          </Text>
        </View>
        <View style={styles.messageTimeContainer}>
          <Text style={styles.messageTime}>
            {formatKSTTime(room.lastMessageTime)}
          </Text>
          {shouldShowUnreadIndicator(room) && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 탭 전환 버튼 */}
      <TabHeader activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 쪽지 화면일 때만 필터 표시 */}
      {activeTab === 'message' && (
        <MessageFilter onFilterChange={handleFilterChange} />
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1CBFDC"
            colors={['#1CBFDC']}
          />
        }>
        {/* 로딩 표시 */}
        {isLoading && activeTab === 'message' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1CBFDC" />
            <Text style={styles.loadingText}>
              {t('messages.loadingDmList', {
                defaultValue: '쪽지 목록을 불러오는 중...',
              })}
            </Text>
          </View>
        )}

        {/* 모임톡 로딩 표시 */}
        {isLoading && activeTab === 'chat' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1CBFDC" />
            <Text style={styles.loadingText}>
              {t('messages.loadingGroupList', {
                defaultValue: '모임톡 목록을 불러오는 중...',
              })}
            </Text>
          </View>
        )}

        {/* 쪽지 화면일 때 */}
        {activeTab === 'message' && !isLoading ? (
          // API로부터 가져온 DM 채팅방 목록
          <View style={styles.directMessagesContainer}>
            {directMessages.length > 0 ? (
              directMessages.map(room => renderDmChatRoomItem(room))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {t('messages.noDirectMessages')}
                </Text>
              </View>
            )}
          </View>
        ) : (
          // 모임톡 목록 (API에서 가져온 데이터)
          !isLoading && (
            <View>
              {groupChatRooms.length > 0 ? (
                groupChatRooms.map(room => renderGroupChatRoomItem(room))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {t('messages.noGroupChats')}
                  </Text>
                </View>
              )}
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatRoomListScreen;
