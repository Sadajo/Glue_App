import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  getGroupMessages,
  sendGroupMessage,
  getGroupChatRoomDetail,
  leaveGroupChatRoom,
} from '../api/api';
import {GroupMessageResponse, GroupChatRoomDetail} from '../api/api';
import {webSocketService} from '../lib/websocket';
import {secureStorage} from '@shared/lib/security';

interface RouteParams {
  groupChatroomId: number;
}

const GroupChatRoomScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {groupChatroomId} = route.params as RouteParams;

  const [messages, setMessages] = useState<GroupMessageResponse[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatRoomDetail, setChatRoomDetail] =
    useState<GroupChatRoomDetail | null>(null);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // 현재 사용자 ID 로드
  useEffect(() => {
    const loadCurrentUserId = async () => {
      try {
        const userId = await secureStorage.getUserId();
        setCurrentUserId(userId);
        console.log('[GroupChatRoom] 현재 사용자 ID:', userId);
      } catch (error) {
        console.error('[GroupChatRoom] 사용자 ID 로드 실패:', error);
      }
    };
    loadCurrentUserId();
  }, []);

  const loadChatRoomDetail = useCallback(async () => {
    try {
      const response = await getGroupChatRoomDetail(groupChatroomId);
      if (response.success) {
        setChatRoomDetail(response.data);
        navigation.setOptions({
          title: response.data.meeting.meetingTitle,
        });
      }
    } catch (error) {
      console.error('[GroupChatRoom] 채팅방 상세 정보 로드 실패:', error);
      Alert.alert('오류', '채팅방 정보를 불러오는데 실패했습니다.');
    }
  }, [groupChatroomId, navigation]);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getGroupMessages(groupChatroomId);
      if (response.success) {
        setMessages(response.data);
        console.log(
          `[GroupChatRoom] 메시지 ${response.data.length}개 로드 완료`,
        );
      }
    } catch (error) {
      console.error('[GroupChatRoom] 메시지 로드 실패:', error);
      Alert.alert('오류', '메시지를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [groupChatroomId]);

  // 채팅방 상세 정보 로드
  useEffect(() => {
    if (groupChatroomId) {
      loadChatRoomDetail();
    }
  }, [groupChatroomId, loadChatRoomDetail]);

  // 메시지 목록 로드
  useEffect(() => {
    if (groupChatroomId) {
      loadMessages();
    }
  }, [groupChatroomId, loadMessages]);

  // WebSocket 연결 및 구독
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        if (!currentUserId) {
          console.log(
            '[GroupChatRoom] 사용자 ID가 없어 WebSocket 연결을 건너뜁니다.',
          );
          return;
        }

        // WebSocket 연결
        await webSocketService.connectWebSocket(currentUserId);

        // 그룹 채팅방 구독
        const subscribed =
          webSocketService.subscribeToGroupChatRoom(groupChatroomId);
        if (subscribed) {
          console.log(
            `[GroupChatRoom] 그룹 채팅방 ${groupChatroomId} 구독 성공`,
          );
        }
      } catch (error) {
        console.error('[GroupChatRoom] WebSocket 연결 실패:', error);
      }
    };

    if (currentUserId) {
      connectWebSocket();
    }

    // 그룹 메시지 리스너 설정
    webSocketService.setGroupMessageListener(
      (message: GroupMessageResponse) => {
        console.log('[GroupChatRoom] 새 메시지 수신:', message);
        setMessages(prev => [message, ...prev]);
      },
    );

    return () => {
      // 구독 해제
      webSocketService.unsubscribeFromGroupChatRoom(groupChatroomId);
      webSocketService.setGroupMessageListener(null);
    };
  }, [groupChatroomId, currentUserId]);

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      const response = await sendGroupMessage(
        groupChatroomId,
        inputText.trim(),
      );
      if (response.success) {
        setInputText('');
        console.log('[GroupChatRoom] 메시지 전송 성공:', response.data);
      }
    } catch (error) {
      console.error('[GroupChatRoom] 메시지 전송 실패:', error);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleLeaveChatRoom = async () => {
    Alert.alert('채팅방 나가기', '정말로 이 채팅방을 나가시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '나가기',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await leaveGroupChatRoom(groupChatroomId);
            if (response.success) {
              Alert.alert('알림', '채팅방에서 나갔습니다.');
              navigation.goBack();
            }
          } catch (error) {
            console.error('[GroupChatRoom] 채팅방 나가기 실패:', error);
            Alert.alert('오류', '채팅방을 나가는데 실패했습니다.');
          }
        },
      },
    ]);
  };

  const renderMessage = ({item}: {item: GroupMessageResponse}) => (
    <View style={styles.messageContainer}>
      <View style={styles.messageHeader}>
        <Text style={styles.senderName}>
          {item.sender?.userNickname || '알 수 없는 사용자'}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>메시지를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 채팅방 정보 헤더 */}
      {chatRoomDetail && (
        <View style={styles.header}>
          <Text style={styles.roomTitle}>
            {chatRoomDetail.meeting.meetingTitle}
          </Text>
          <Text style={styles.participantCount}>
            참여자 {chatRoomDetail.participants.length}명
          </Text>
          <TouchableOpacity
            onPress={handleLeaveChatRoom}
            style={styles.leaveButton}>
            <Text style={styles.leaveButtonText}>나가기</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 메시지 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.groupMessageId.toString()}
        style={styles.messageList}
        inverted
        showsVerticalScrollIndicator={false}
      />

      {/* 메시지 입력 */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="메시지를 입력하세요..."
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || sending}>
          <Text style={styles.sendButtonText}>
            {sending ? '전송 중...' : '전송'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  participantCount: {
    fontSize: 14,
    color: '#6C757D',
    marginRight: 10,
  },
  leaveButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  timestamp: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  messageText: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ADB5BD',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupChatRoomScreen;
