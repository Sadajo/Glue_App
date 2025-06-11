import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text as RNText,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
  AppState,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {styles} from './styles';
import {
  ChatHeader,
  ChatMessage,
  ChatInput,
  ChatRoomInfo,
} from '../../components';
import {
  useGroupMessages,
  useSendGroupMessage,
  useGroupChatRoomDetail,
  useToggleGroupChatRoomNotification,
  useLeaveGroupChatRoom,
} from '../../api/hooks';
import {GroupMessageResponse} from '../../api/api';
import {toastService} from '@shared/lib/notifications/toast';
import {secureStorage} from '@shared/lib/security';
import {webSocketService} from '../../lib/websocket';
import {dummyProfile} from '@shared/assets/images';
import {useTranslation} from 'react-i18next';

interface GroupChatRoomScreenProps {
  route?: {
    params: {
      groupChatroomId?: number;
      meetingTitle?: string;
    };
  };
  navigation?: any;
}

const GroupChatRoomScreen: React.FC<GroupChatRoomScreenProps> = ({
  route,
  navigation,
}) => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const scrollViewRef = useRef<FlatList<GroupMessageResponse>>(null);

  const [_stickyDate, _setStickyDate] = useState<string>('');

  // 채팅방 정보 모달 관련 상태
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get('window').width),
  ).current;

  // route.params에서 groupChatroomId 가져오기
  const groupChatroomId = route?.params?.groupChatroomId;
  const meetingTitle = route?.params?.meetingTitle || '모임톡';

  // 현재 사용자 정보 상태
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // API 훅들
  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMessages,
  } = useGroupMessages(groupChatroomId || -1);

  // 메시지 전송 뮤테이션 훅
  const sendGroupMessageMutation = useSendGroupMessage();

  // 그룹 채팅방 상세 정보 API 훅
  const {
    data: groupChatRoomDetail,
    isError: isGroupDetailError,
    error: groupDetailError,
    refetch: refetchGroupDetail,
  } = useGroupChatRoomDetail(groupChatroomId || -1);

  // 알림 토글 뮤테이션 훅
  const toggleNotificationMutation = useToggleGroupChatRoomNotification();

  // 채팅방 나가기 뮤테이션 훅
  const leaveChatRoomMutation = useLeaveGroupChatRoom();

  // 메시지 캐싱을 위한 상태
  const [messageCache, setMessageCache] = useState<Set<number>>(new Set());
  const [_pendingMessages, setPendingMessages] = useState<Set<string>>(new Set());

  // WebSocket 메시지 리스너 설정 - React Query 캐시에 직접 추가
  useEffect(() => {
    if (!groupChatroomId) return;

    let isComponentMounted = true;

    // 그룹 메시지 수신 리스너 설정 (이 채팅방 메시지만 필터링)
    webSocketService.setGroupMessageListener((groupMessage: GroupMessageResponse) => {
      if (!isComponentMounted) return;

      // 현재 채팅방의 메시지만 처리
      if (groupMessage.groupChatroomId === groupChatroomId) {
        // 메시지 ID가 없으면 무시
        if (!groupMessage.groupMessageId) {
          console.warn('[GroupChatRoomScreen] 메시지 ID가 없는 메시지 무시:', groupMessage);
          return;
        }

        // 이미 캐시된 메시지인지 확인
        if (messageCache.has(groupMessage.groupMessageId)) {
          console.log('[GroupChatRoomScreen] 이미 캐시된 메시지 무시:', groupMessage.groupMessageId);
          return;
        }

        // 내가 보낸 메시지는 낙관적 업데이트로 이미 추가되었으므로 WebSocket으로 받은 것은 무시
        if (groupMessage.sender?.userId === currentUserId) {
          console.log('[GroupChatRoomScreen] 내가 보낸 메시지 WebSocket 응답 무시:', groupMessage.groupMessageId);
          return;
        }

        // 메시지 캐시에 추가
        setMessageCache(prev => new Set([...prev, groupMessage.groupMessageId!]));

        const queryKey = ['groupMessages', groupChatroomId.toString()];

        // React Query 캐시에 직접 메시지 추가
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.pages) return old;

          const newPages = [...old.pages];
          if (newPages.length > 0) {
            // 중복 체크 (추가 안전장치)
            const firstPageData = newPages[0].data || [];
            const exists = firstPageData.find(
              (msg: GroupMessageResponse) =>
                msg.groupMessageId === groupMessage.groupMessageId,
            );

            if (!exists) {
              // 첫 번째 페이지 (최신 메시지들)에 새 메시지 추가
              newPages[0] = {
                ...newPages[0],
                data: [groupMessage, ...firstPageData],
              };
              console.log('[GroupChatRoomScreen] 새 메시지 캐시에 추가:', groupMessage.groupMessageId);
            }
          }

          return {...old, pages: newPages};
        });
      }
    });

    // 그룹 채팅방 구독 시작
    const subscribeToGroup = async () => {
      // WebSocket 연결 대기
      const isConnected = await webSocketService.waitForConnection(5000);
      if (isConnected) {
        webSocketService.subscribeToGroupChatRoom(groupChatroomId);
      } else {
        console.error('[GroupChatRoomScreen] WebSocket 연결 대기 실패');
      }
    };

    subscribeToGroup();

    // 클린업: 리스너 제거 및 구독 해제
    return () => {
      isComponentMounted = false;
      webSocketService.setGroupMessageListener(null);
      webSocketService.unsubscribeFromGroupChatRoom(groupChatroomId);
    };
  }, [groupChatroomId, queryClient, currentUserId, messageCache]);

  // 날짜 포맷팅 함수를 먼저 선언
  const formatDateForDivider = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return new Date().toISOString();

      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return new Date().toISOString();
    }
  }, []);

  // 에러 처리
  useEffect(() => {
    if (isMessagesError && messagesError) {
      console.error('[GroupChatRoomScreen] 메시지 목록 에러:', messagesError);
      toastService.error('오류', messagesError.message);
    }
  }, [isMessagesError, messagesError]);

  // 그룹 채팅방 상세 정보 에러 처리
  useEffect(() => {
    if (isGroupDetailError && groupDetailError) {
      console.error(
        '[GroupChatRoomScreen] 그룹 채팅방 상세 정보 에러:',
        groupDetailError,
      );
      toastService.error('오류', groupDetailError.message);
    }
  }, [isGroupDetailError, groupDetailError]);

  // 그룹 채팅방 상세 정보 로드 시 디버깅
  useEffect(() => {
    if (groupChatRoomDetail?.data) {
      console.log('=== 그룹 채팅방 상세 정보 ===');
      console.log('전체 응답:', groupChatRoomDetail.data);
      console.log('참여자 목록:', groupChatRoomDetail.data.participants);
      groupChatRoomDetail.data.participants.forEach((participant, index) => {
        console.log(`참여자 ${index + 1}:`, {
          userId: participant.user.userId,
          userNickname: participant.user.userNickname,
          profileImageUrl: participant.user.profileImageUrl,
          isHost: participant.isHost,
        });
      });
    }
  }, [groupChatRoomDetail]);

  // 무한 스크롤 메시지 데이터를 평면 배열로 변환 (React Query 캐시에서 직접 사용)
  const messages = useMemo(() => {
    if (!messagesData?.pages) return [];

    // 모든 페이지의 메시지를 하나의 배열로 합치기
    const combined = messagesData.pages.flatMap(page => page.data || []);

    // 중복 제거 (더 엄격하게)
    const uniqueMessages = combined.filter(
      (message, index, array) => {
        // 메시지 ID가 없는 경우 제외
        if (!message.groupMessageId) return false;
        
        // 동일한 메시지 ID의 첫 번째 인스턴스만 유지
        const firstIndex = array.findIndex(m => m.groupMessageId === message.groupMessageId);
        return firstIndex === index;
      }
    );

    // 시간순으로 정렬 후 역순으로 배치 (inverted FlatList용)
    return uniqueMessages.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [messagesData]);

  // 메시지 데이터가 변경될 때마다 캐시 업데이트
  useEffect(() => {
    const currentMessageIds = messages
      .map(msg => msg.groupMessageId)
      .filter((id): id is number => id !== undefined);
    
    if (currentMessageIds.length > 0) {
      setMessageCache(prev => {
        const newCache = new Set(prev);
        currentMessageIds.forEach(id => newCache.add(id));
        return newCache;
      });
    }
  }, [messages]);

  // 현재 사용자 ID 설정
  useEffect(() => {
    const initCurrentUser = async () => {
      try {
        const userId = await secureStorage.getUserId();
        setCurrentUserId(userId);
        console.log('=== 현재 사용자 정보 ===');
        console.log('현재 사용자 ID:', userId);
      } catch (error) {
        console.error('현재 사용자 ID 가져오기 실패:', error);
      }
    };

    initCurrentUser();
  }, []);

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      if (groupChatroomId) {
        console.log('[GroupChatRoomScreen] 화면 포커스 - 데이터 새로고침');
        // 메시지 목록과 채팅방 상세 정보 새로고침
        refetchMessages();
        refetchGroupDetail();
      }
    }, [groupChatroomId, refetchMessages, refetchGroupDetail]),
  );

  // 앱 상태 변화 감지 (백그라운드에서 포그라운드로 돌아올 때)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && groupChatroomId) {
        console.log('[GroupChatRoomScreen] 앱 활성화 - 데이터 새로고침');
        refetchMessages();
        refetchGroupDetail();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
    };
  }, [groupChatroomId, refetchMessages, refetchGroupDetail]);

  // 메시지 전송 핸들러 - React Query 뮤테이션 사용 (이미 낙관적 업데이트 구현됨)
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!groupChatroomId || !currentUserId) {
        toastService.error('오류', '채팅방 정보가 없습니다.');
        return;
      }

      try {
        // 중복 방지를 위한 임시 메시지 ID 생성
        const tempMessageId = `temp_${currentUserId}_${Date.now()}_${Math.random()}`;
        
        // 전송 중인 메시지로 마킹
        setPendingMessages(prev => new Set([...prev, tempMessageId]));
        
        console.log('[GroupChatRoomScreen] 메시지 전송 시작:', tempMessageId);

        // useSendGroupMessage 훅이 이미 낙관적 업데이트를 처리함
        const result = await sendGroupMessageMutation.mutateAsync({
          groupChatroomId,
          content: text,
        });

        // 성공 후 전송 완료 처리
        setPendingMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempMessageId);
          return newSet;
        });

        // 실제 메시지 ID를 캐시에 추가 (중복 방지)
        if (result?.data?.groupMessageId) {
          setMessageCache(prev => new Set([...prev, result.data.groupMessageId]));
          console.log('[GroupChatRoomScreen] 전송된 메시지 캐시에 추가:', result.data.groupMessageId);
        }

      } catch (error: any) {
        console.error('메시지 전송 실패:', error);
        
        // 실패 시 전송 중 상태 제거
        const tempMessageId = `temp_${currentUserId}_${Date.now()}`;
        setPendingMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(tempMessageId);
          return newSet;
        });
        
        toastService.error('전송 실패', '메시지 전송에 실패했습니다.');
      }
    },
    [groupChatroomId, currentUserId, sendGroupMessageMutation],
  );

  // 뒤로 가기 핸들러
  const handleBackPress = () => {
    navigation?.goBack();
  };

  const handleMenuPress = () => {
    setShowRoomInfo(true);
    setIsClosing(false);
  };

  // 사이드 패널 애니메이션 - ChatRoomScreen과 동일한 방식
  useEffect(() => {
    if (showRoomInfo && !isClosing) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(slideAnim, {
          toValue: Dimensions.get('window').width * 0.25,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (isClosing) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(slideAnim, {
          toValue: Dimensions.get('window').width,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowRoomInfo(false);
        setIsClosing(false);
        slideAnim.setValue(Dimensions.get('window').width);
      });
    }
  }, [showRoomInfo, isClosing, fadeAnim, slideAnim]);

  const closeRoomInfo = () => {
    if (!isClosing) {
      setIsClosing(true);
    }
  };

  // 팬 제스처 응답기 - ChatRoomScreen과 동일한 방식
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          gestureState.dx > 10 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          slideAnim.setValue(
            Dimensions.get('window').width * 0.25 + gestureState.dx,
          );
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > Dimensions.get('window').width * 0.2) {
          closeRoomInfo();
        } else {
          Animated.spring(slideAnim, {
            toValue: Dimensions.get('window').width * 0.25,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  // 알림 토글 핸들러
  const handleNotificationToggle = async () => {
    console.log('🔔 GroupChatRoom handleNotificationToggle 호출됨');
    
    if (!groupChatroomId) {
      console.log('❌ groupChatroomId가 없음:', groupChatroomId);
      return;
    }

    const currentState = groupChatRoomDetail?.data?.pushNotificationOn;
    console.log('🔔 알림 토글 시작:', {
      groupChatroomId,
      currentState,
      expectedNewState: currentState === 1 ? 0 : 1,
      mutationStatus: toggleNotificationMutation.status
    });

    try {
      const result = await toggleNotificationMutation.mutateAsync({groupChatroomId});
      console.log('✅ 알림 토글 성공:', {
        result,
        newState: groupChatRoomDetail?.data?.pushNotificationOn
      });
      toastService.success('알림 설정', '알림 설정이 변경되었습니다.');
    } catch (error: any) {
      console.error('❌ 알림 토글 실패:', {
        error,
        currentState: groupChatRoomDetail?.data?.pushNotificationOn,
        groupChatroomId
      });
      toastService.error(
        '오류',
        error.message || '알림 설정 변경에 실패했습니다.',
      );
    }
  };

  // 채팅방 나가기 핸들러
  const handleLeaveRoom = async () => {
    if (!groupChatroomId) return;

    try {
      await leaveChatRoomMutation.mutateAsync({groupChatroomId});
      toastService.success('채팅방 나가기', '채팅방을 나갔습니다.');
      navigation?.goBack();
    } catch (error: any) {
      toastService.error(
        '오류',
        error.message || '채팅방 나가기에 실패했습니다.',
      );
    }
  };

  // 이전 메시지 로드 핸들러 - 맨 아래 도달시 호출
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('[GroupChatRoomScreen] 이전 메시지 로드');
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 수동 새로고침 핸들러 (pull to refresh)
  const handleRefresh = useCallback(async () => {
    if (!groupChatroomId) return;
    
    console.log('[GroupChatRoomScreen] 수동 새로고침');
    try {
      await Promise.all([
        refetchMessages(),
        refetchGroupDetail(),
      ]);
    } catch (error) {
      console.error('[GroupChatRoomScreen] 새로고침 실패:', error);
    }
  }, [groupChatroomId, refetchMessages, refetchGroupDetail]);


  // 메시지 렌더링 함수
  const renderMessage = useCallback(
    ({item: message}: {item: GroupMessageResponse}) => {
      // message 안전성 검사
      if (!message) {
        console.warn('Invalid message:', message);
        return null;
      }

      // 메시지 ID 검사
      if (!message.groupMessageId) {
        console.warn('Message without ID:', message);
        return null;
      }

      // senderId 또는 sender.userId 가져오기
      const messageSenderId = message.sender?.userId;
      if (!messageSenderId) {
        console.warn('No sender ID found in message:', message);
        return null;
      }

      // 일반 텍스트 메시지 렌더링
      return (
        <ChatMessage
          id={message.groupMessageId.toString()}
          text={message.message || ''}
          timestamp={
            message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : '시간 미상'
          }
          isMine={messageSenderId === currentUserId}
          sender={{
            id: message.sender?.userId?.toString() || 'unknown',
            name:
              message.sender?.userNickname ||
              t('common.unknownUser', {defaultValue: '알 수 없는 사용자'}),
            profileImage:
              message.sender?.profileImageUrl &&
              message.sender.profileImageUrl.trim() !== ''
                ? message.sender.profileImageUrl
                : '',
            isHost: false, // TODO: 그룹 채팅에서는 호스트 정보 필요시 추가
          }}
        />
      );
    },
    [currentUserId, t],
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#1CBFDC" />
        <RNText style={styles.loadingText}>이전 메시지를 불러오는 중...</RNText>
      </View>
    );
  };

  // 로딩 상태
  if (isMessagesLoading && messages.length === 0) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color="#1CBFDC" />
        <RNText style={{marginTop: 10, color: '#666'}}>
          메시지를 불러오는 중...
        </RNText>
      </SafeAreaView>
    );
  }

  // 에러 발생 시
  if (!groupChatroomId) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <RNText style={{color: 'red', textAlign: 'center', padding: 20}}>
          채팅방 ID가 제공되지 않았습니다.
        </RNText>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ChatHeader
          title={meetingTitle}
          memberCount={groupChatRoomDetail?.data?.participants?.length || 0}
          onBackPress={handleBackPress}
          onMenuPress={handleMenuPress}
        />

        <FlatList
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.contentContainer,
            messages.length === 0 && {flex: 1},
          ]}
          data={messages}
          keyExtractor={(item: GroupMessageResponse, index: number) => {
            return (
              item.groupMessageId?.toString() ||
              `msg-${item.sender?.userId}-${index}-${item.createdAt || Date.now()}`
            );
          }}
          renderItem={renderMessage}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          inverted
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={false}
          windowSize={10}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={100}
          initialNumToRender={20}
          ListFooterComponent={renderFooter}
          refreshing={isMessagesLoading && messages.length > 0}
          onRefresh={handleRefresh}
        />

        <ChatInput onSend={handleSendMessage} />

        {/* 채팅방 정보 모달 */}
        {groupChatRoomDetail?.data && (
          <Animated.View
            style={[
              styles.modalOverlay,
              {
                opacity: fadeAnim,
                display: showRoomInfo || isClosing ? 'flex' : 'none',
              },
            ]}>
            <TouchableWithoutFeedback onPress={closeRoomInfo}>
              <View style={styles.overlayTouchable} />
            </TouchableWithoutFeedback>

            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.sidePanel,
                {
                  transform: [{translateX: slideAnim}],
                },
              ]}>
              <ChatRoomInfo
                roomName={groupChatRoomDetail.data.meeting.meetingTitle}
                roomIcon={
                  groupChatRoomDetail.data.meeting.meetingImageUrl || undefined
                }
                memberCount={groupChatRoomDetail.data.participants.length}
                category="모임" // 그룹 채팅방 카테고리
                postTitle={groupChatRoomDetail.data.meeting.meetingTitle} // 모임 제목을 postTitle로도 사용
                isDirectMessage={false}
                members={groupChatRoomDetail.data.participants.map(
                  (participant, index) => {
                    // 실제 API 응답 구조에 맞게 user 객체에서 정보 추출
                    const user = participant.user;

                    // 사용자 이름 결정 로직
                    let displayName = '알 수 없는 사용자';

                    if (user.userNickname) {
                      const trimmedName = user.userNickname.trim();
                      if (trimmedName.length > 0) {
                        displayName = trimmedName;
                      }
                    }

                    // 여전히 이름이 없으면 userId 기반으로 생성
                    if (displayName === '알 수 없는 사용자' && user.userId) {
                      displayName = `사용자${user.userId}`;
                    }

                    console.log(`ChatRoomInfo 참여자 ${index + 1} 매핑:`, {
                      original: participant,
                      mapped: {
                        id: user.userId?.toString() || 'unknown',
                        name: displayName,
                        profileImage: user.profileImageUrl || dummyProfile,
                        isHost: participant.isHost,
                      },
                    });

                    return {
                      id: user.userId?.toString() || 'unknown',
                      name: displayName,
                      profileImage:
                        user.profileImageUrl &&
                        user.profileImageUrl.trim() !== ''
                          ? user.profileImageUrl
                          : dummyProfile,
                      isHost: participant.isHost, // 실제 호스트 정보 사용
                      isOnline: false, // TODO: 온라인 상태 정보 추가 필요
                    };
                  },
                )}
                onClose={closeRoomInfo}
                onLeaveRoom={handleLeaveRoom}
                isNotificationEnabled={
                  groupChatRoomDetail.data.pushNotificationOn === 1
                }
                onNotificationToggle={handleNotificationToggle}
                meetingId={groupChatRoomDetail.data.meeting.meetingId}
                navigation={navigation}
              />
            </Animated.View>
          </Animated.View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default GroupChatRoomScreen;
