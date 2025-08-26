import {useApiQuery, useApiMutation, ApiResponse} from '@/shared/lib/api/hooks';
import {
  useQueryClient,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import {
  DmChatRoom,
  getHostedDmRooms,
  getParticipatedDmRooms,
  ActualDmChatRoomDetailResponse,
  getDmChatRoomDetail,
  DmMessageResponse,
  getDmMessages,
  sendDmMessage,
  toggleDmChatRoomNotification,
  GroupChatRoom,
  getGroupChatRooms,
  GroupMessageResponse,
  getGroupMessages,
  GroupChatRoomDetail,
  getGroupChatRoomDetail,
  sendGroupMessage,
  toggleGroupChatRoomNotification,
  leaveGroupChatRoom,
  GroupChatRoomLeaveResponse,
  // 초대 관련 import
  InvitationCreateResponse,
  InvitationAcceptResponse,
  createMeetingInvitation,
  acceptInvitation,
  getInvitationStatus,
  // 그룹 채팅방 참여 관련 import
  JoinGroupChatRoomResponse,
  joinGroupChatRoom,
  // 모임 참가 여부 확인 관련 import
  CheckParticipationResponse,
  checkMeetingParticipation,
} from './api';

/**
 * 내가 호스트인 DM 채팅방 목록을 가져오는 React Query 훅
 * @returns useQuery 훅의 반환값
 */
export const useHostedDmRooms = () => {
  return useApiQuery<DmChatRoom[]>(
    ['hostedDmRooms'],
    () => getHostedDmRooms(),
    {
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터 신선한 상태 유지
      refetchOnWindowFocus: true, // 창이 포커스될 때 다시 가져오기
      retry: 1, // 실패 시 1번 재시도
    },
  );
};

/**
 * 내가 참여자인 DM 채팅방 목록을 가져오는 React Query 훅
 * @returns useQuery 훅의 반환값
 */
export const useParticipatedDmRooms = () => {
  return useApiQuery<DmChatRoom[]>(
    ['participatedDmRooms'],
    () => getParticipatedDmRooms(),
    {
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터 신선한 상태 유지
      refetchOnWindowFocus: true, // 창이 포커스될 때 다시 가져오기
      retry: 1, // 실패 시 1번 재시도
    },
  );
};

/**
 * 참여 중인 그룹 채팅방 목록을 가져오는 React Query 훅
 * @param cursorId 커서 ID (페이지네이션용)
 * @param pageSize 페이지 크기 (기본값: 10)
 * @returns useQuery 훅의 반환값
 */
export const useGroupChatRooms = (cursorId?: number, pageSize: number = 10) => {
  return useApiQuery<GroupChatRoom[]>(
    [
      'groupChatRooms',
      cursorId ? cursorId.toString() : 'none',
      pageSize.toString(),
    ],
    () => getGroupChatRooms(cursorId, pageSize),
    {
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터 신선한 상태 유지
      refetchOnWindowFocus: true, // 창이 포커스될 때 다시 가져오기
      retry: (failureCount, error) => {
        // 서버 오류(500)의 경우 재시도하지 않음
        if (error instanceof Error && error.message.includes('서버 오류')) {
          return false;
        }
        // 최대 2번까지 재시도
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
    },
  );
};

/**
 * DM 채팅방 상세 정보를 가져오는 React Query 훅
 * @param dmChatRoomId 채팅방 ID
 * @param options 추가 옵션
 * @returns useQuery 훅의 반환값
 */
export const useDmChatRoomDetail = (
  dmChatRoomId?: number,
  _options?: {enabled?: boolean},
) => {
  return useApiQuery<ActualDmChatRoomDetailResponse>(
    ['dmChatRoomDetail', dmChatRoomId?.toString() || 'none'],
    () => getDmChatRoomDetail(dmChatRoomId!),
    {
      staleTime: 1000 * 60 * 2, // 2분 동안 데이터 신선한 상태 유지
      refetchOnWindowFocus: false, // 창 포커스 시 다시 가져오기 안함
      retry: 1, // 실패 시 1번 재시도
      enabled: Boolean(dmChatRoomId && dmChatRoomId > 0), // 유효한 dmChatRoomId일 때만 쿼리 실행
    },
  );
};

/**
 * DM 메시지 목록을 무한 스크롤로 가져오는 React Query 훅
 * @param dmChatRoomId 채팅방 ID
 * @param options 추가 옵션
 * @returns useInfiniteQuery 훅의 반환값
 */
export const useDmMessages = (
  dmChatRoomId?: number,
  _options?: {enabled?: boolean},
) => {
  return useInfiniteQuery<ApiResponse<DmMessageResponse[]>, Error>({
    queryKey: ['dmMessages', dmChatRoomId?.toString() || 'none'],
    queryFn: async ({pageParam}) => {
      const cursorId = pageParam as number | undefined;
      const response = await getDmMessages(dmChatRoomId!, cursorId, 20);
      return response;
    },
    getNextPageParam: lastPage => {
      // 이전 메시지를 가져오려면 현재 페이지의 첫 번째 메시지 ID를 커서로 사용
      if (lastPage.data && lastPage.data.length > 0) {
        const firstMessage = lastPage.data[0]; // 마지막이 아니라 첫 번째!
        console.log('📍 다음 페이지 커서:', firstMessage.dmMessageId);
        return firstMessage.dmMessageId;
      }
      return undefined; // 더 이상 페이지가 없음
    },
    getPreviousPageParam: _firstPage => {
      // 이전 페이지는 사용하지 않음 (채팅은 보통 아래에서 위로 로드)
      return undefined;
    },
    initialPageParam: undefined,
    staleTime: 0, // 항상 stale로 취급하여 화면 볼 때마다 최신 데이터 확인
    refetchOnWindowFocus: true, // 창 포커스 시 자동 새로고침
    refetchOnMount: 'always', // 마운트 시 항상 새로고침
    retry: 1, // 실패 시 1번 재시도
    enabled: Boolean(dmChatRoomId && dmChatRoomId > 0), // 유효한 dmChatRoomId일 때만 쿼리 실행
  });
};

/**
 * 그룹 메시지 목록을 무한 스크롤로 가져오는 React Query 훅
 * @param groupChatroomId 그룹 채팅방 ID
 * @returns useInfiniteQuery 훅의 반환값
 */
export const useGroupMessages = (groupChatroomId: number) => {
  return useInfiniteQuery<ApiResponse<GroupMessageResponse[]>, Error>({
    queryKey: ['groupMessages', groupChatroomId.toString()],
    queryFn: async ({pageParam}) => {
      const cursorId = pageParam as number | undefined;
      const response = await getGroupMessages(groupChatroomId, cursorId, 20);
      return response;
    },
    getNextPageParam: lastPage => {
      // 이전 메시지를 가져오려면 현재 페이지의 첫 번째 메시지 ID를 커서로 사용
      if (lastPage.data && lastPage.data.length > 0) {
        const firstMessage = lastPage.data[0]; // 마지막이 아니라 첫 번째!
        console.log('📍 다음 페이지 커서 (그룹):', firstMessage.groupMessageId);
        return firstMessage.groupMessageId;
      }
      return undefined; // 더 이상 페이지가 없음
    },
    getPreviousPageParam: _firstPage => {
      // 이전 페이지는 사용하지 않음 (채팅은 보통 아래에서 위로 로드)
      return undefined;
    },
    initialPageParam: undefined,
    staleTime: 1000 * 60 * 2, // 2분간 캐시 유지
    refetchOnWindowFocus: false, // 창 포커스 시 자동 새로고침 안함
    retry: 1, // 실패 시 1번 재시도
    enabled: groupChatroomId !== -1 && groupChatroomId > 0, // 유효한 groupChatroomId일 때만 쿼리 실행
  });
};

/**
 * 그룹 채팅방 상세 정보를 가져오는 React Query 훅
 * @param groupChatroomId 그룹 채팅방 ID
 * @returns useQuery 훅의 반환값
 */
export const useGroupChatRoomDetail = (groupChatroomId: number) => {
  return useApiQuery<GroupChatRoomDetail>(
    ['groupChatRoomDetail', groupChatroomId.toString()],
    () => getGroupChatRoomDetail(groupChatroomId),
    {
      staleTime: 1000 * 60 * 2, // 2분 동안 데이터 신선한 상태 유지
      refetchOnWindowFocus: false, // 창 포커스 시 다시 가져오기 안함
      retry: 1, // 실패 시 1번 재시도
      enabled: groupChatroomId !== -1 && groupChatroomId > 0, // 유효한 groupChatroomId일 때만 쿼리 실행
    },
  );
};

/**
 * DM 메시지 전송을 위한 React Query 뮤테이션 훅
 * @returns useMutation 훅의 반환값
 */
export const useSendDmMessage = () => {
  const queryClient = useQueryClient();

  return useApiMutation<
    DmMessageResponse,
    {dmChatRoomId: number; content: string}
  >(
    'sendDmMessage',
    ({dmChatRoomId, content}) => sendDmMessage(dmChatRoomId, content),
    {
      onSuccess: (response, _variables) => {
        console.log('DM 메시지 전송 성공:', response.data);

        // 채팅방 목록 업데이트 (마지막 메시지 정보 동기화)
        queryClient.invalidateQueries({
          queryKey: ['hostedDmRooms'],
        });
        queryClient.invalidateQueries({
          queryKey: ['participatedDmRooms'],
        });
      },

      onError: (error, _variables, _context) => {
        console.error('DM 메시지 전송 실패:', error);
      },
    },
  );
};

/**
 * 그룹 메시지 전송을 위한 React Query 뮤테이션 훅
 * @returns useMutation 훅의 반환값
 */
export const useSendGroupMessage = () => {
  const queryClient = useQueryClient();

  return useApiMutation<
    GroupMessageResponse,
    {groupChatroomId: number; content: string}
  >(
    'sendGroupMessage',
    ({groupChatroomId, content}) => sendGroupMessage(groupChatroomId, content),
    {
      onSuccess: (response, _variables) => {
        console.log('그룹 메시지 전송 성공:', response.data);

        // 채팅방 목록 업데이트 (마지막 메시지 정보 동기화)
        queryClient.invalidateQueries({
          queryKey: ['groupChatRooms'],
        });
      },

      onError: (error, _variables, _context) => {
        console.error('그룹 메시지 전송 실패:', error);
      },
    },
  );
};

/**
 * 그룹 채팅방 알림 설정 토글을 위한 React Query 뮤테이션 훅
 * @returns useMutation 훅의 반환값
 */
export const useToggleGroupChatRoomNotification = () => {
  const queryClient = useQueryClient();

  return useApiMutation<number, {groupChatroomId: number}>(
    'toggleGroupChatRoomNotification',
    ({groupChatroomId}) => toggleGroupChatRoomNotification(groupChatroomId),
    {
      // 낙관적 업데이트: 알림 설정 전에 즉시 UI에 반영
      onMutate: async ({groupChatroomId}) => {
        const queryKey = ['groupChatRoomDetail', groupChatroomId.toString()];

        // 진행 중인 refetch 취소
        await queryClient.cancelQueries({queryKey});

        // 이전 데이터 백업
        const previousData = queryClient.getQueryData(queryKey);

        // 낙관적 업데이트: 현재 상태의 반대로 변경
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.data || old.data.pushNotificationOn === undefined) {
            console.warn('🔔 그룹 채팅방 데이터가 없어 낙관적 업데이트 스킵');
            return old;
          }

          const currentState = old.data.pushNotificationOn;
          const newState = currentState === 1 ? 0 : 1;

          console.log('🔔 그룹 낙관적 업데이트:', {
            groupChatroomId,
            current: currentState,
            new: newState,
          });

          return {
            ...old,
            data: {
              ...old.data,
              pushNotificationOn: newState,
            },
          };
        });

        return {previousData};
      },

      onSuccess: (response, {groupChatroomId}) => {
        console.log('✅ 그룹 채팅방 알림 토글 응답:', response);
        const queryKey = ['groupChatRoomDetail', groupChatroomId.toString()];

        // 서버 응답값으로 쿼리 데이터 업데이트 (확실하게)
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.data) return old;

          // API 응답 구조에 따라 response.data 사용
          const serverNotificationState = response.data;
          const currentState = old.data.pushNotificationOn;

          console.log('🔔 그룹 서버 응답 반영:', {
            groupChatroomId,
            current: currentState,
            server: serverNotificationState,
            willUpdate: currentState !== serverNotificationState,
          });

          // 서버 응답과 현재 상태가 다를 때만 업데이트
          if (currentState !== serverNotificationState) {
            return {
              ...old,
              data: {
                ...old.data,
                pushNotificationOn: serverNotificationState,
              },
            };
          }

          return old; // 변경사항 없으면 기존 데이터 유지
        });
      },

      onError: (error, {groupChatroomId}, context) => {
        console.error('❌ 그룹 채팅방 알림 토글 실패:', error.message);

        // 실패 시 이전 데이터로 롤백
        const typedContext = context as {previousData?: any} | undefined;
        if (typedContext?.previousData) {
          const queryKey = ['groupChatRoomDetail', groupChatroomId.toString()];
          queryClient.setQueryData(queryKey, typedContext.previousData);
        }
      },
    },
  );
};

/**
 * 그룹 채팅방 나가기를 위한 React Query 뮤테이션 훅
 * @returns useMutation 훅의 반환값
 */
export const useLeaveGroupChatRoom = () => {
  const queryClient = useQueryClient();

  return useApiMutation<
    GroupChatRoomLeaveResponse[],
    {groupChatroomId: number}
  >(
    'leaveGroupChatRoom',
    ({groupChatroomId}) => leaveGroupChatRoom(groupChatroomId),
    {
      onSuccess: (response, {groupChatroomId}) => {
        console.log('✅ 그룹 채팅방 나가기 성공:', response);

        // 성공 시 채팅방 목록 새로고침
        queryClient.invalidateQueries({
          queryKey: ['groupChatRooms'],
        });

        // 해당 채팅방과 관련된 캐시 제거
        queryClient.removeQueries({
          queryKey: ['groupMessages', groupChatroomId.toString()],
        });
        queryClient.removeQueries({
          queryKey: ['groupChatRoomDetail', groupChatroomId.toString()],
        });
      },
      onError: error => {
        console.error('❌ 그룹 채팅방 나가기 실패:', error.message);
      },
    },
  );
};

/**
 * DM 채팅방 알림 설정 토글을 위한 React Query 뮤테이션 훅
 * @returns useMutation 훅의 반환값
 */
export const useToggleDmChatRoomNotification = () => {
  const queryClient = useQueryClient();

  return useApiMutation<any, {dmChatRoomId: number}>(
    'toggleDmChatRoomNotification',
    ({dmChatRoomId}) => toggleDmChatRoomNotification(dmChatRoomId),
    {
      // 낙관적 업데이트: 알림 설정 전에 즉시 UI에 반영
      onMutate: async ({dmChatRoomId}) => {
        const queryKey = ['dmChatRoomDetail', dmChatRoomId.toString()];

        // 진행 중인 refetch 취소
        await queryClient.cancelQueries({queryKey});

        // 이전 데이터 백업
        const previousData = queryClient.getQueryData(queryKey);

        // 낙관적 업데이트: 현재 상태의 반대로 변경
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.data) return old;

          const currentState = old.data.isPushNotificationOn;
          const newState = currentState === 1 ? 0 : 1;

          console.log('🔔 DM 낙관적 업데이트:', {
            current: currentState,
            new: newState,
          });

          return {
            ...old,
            data: {
              ...old.data,
              isPushNotificationOn: newState,
            },
          };
        });

        return {previousData};
      },

      onSuccess: (response, {dmChatRoomId}) => {
        console.log('✅ DM 알림 토글 API 응답값:', response.data);
        const queryKey = ['dmChatRoomDetail', dmChatRoomId.toString()];

        // 서버 응답값으로 쿼리 데이터 업데이트 (확실하게)
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.data) return old;

          // API 응답 구조에 따라 response.data 사용
          const newNotificationState = response.data;

          console.log('🔔 DM 서버 응답 반영:', {
            old: old.data.isPushNotificationOn,
            new: newNotificationState,
          });

          return {
            ...old,
            data: {
              ...old.data,
              isPushNotificationOn: newNotificationState,
            },
          };
        });
      },

      onError: (error, {dmChatRoomId}, context) => {
        console.error('❌ DM 알림 토글 실패:', error.message);

        // 실패 시 이전 데이터로 롤백
        const typedContext = context as {previousData?: any} | undefined;
        if (typedContext?.previousData) {
          const queryKey = ['dmChatRoomDetail', dmChatRoomId.toString()];
          queryClient.setQueryData(queryKey, typedContext.previousData);
        }
      },
    },
  );
};

// ============ 초대 관련 훅 ============

/**
 * 모임 초대장 생성을 위한 React Query 뮤테이션 훅
 * @returns useMutation 훅의 반환값
 */
export const useCreateMeetingInvitation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<
    InvitationCreateResponse,
    {meetingId: number; inviteeId: number}
  >(
    'createMeetingInvitation',
    ({meetingId, inviteeId}) => createMeetingInvitation(meetingId, inviteeId),
    {
      onSuccess: (response, {meetingId: _meetingId}) => {
        console.log('✅ 초대장 생성 성공:', response);

        // 초대장 생성 후 해당 채팅방 메시지 목록 새로고침 (초대 메시지가 추가되므로)
        queryClient.invalidateQueries({
          queryKey: ['dmMessages'],
        });

        // 채팅방 목록도 새로고침 (마지막 메시지 업데이트를 위해)
        queryClient.invalidateQueries({
          queryKey: ['hostedDmRooms'],
        });
      },
      onError: error => {
        console.error('❌ 초대장 생성 실패:', error.message);
      },
    },
  );
};

/**
 * 초대장 수락을 위한 React Query 뮤테이션 훅
 * @returns useMutation 훅의 반환값
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useApiMutation<InvitationAcceptResponse, {code: string}>(
    'acceptInvitation',
    ({code}) => acceptInvitation(code),
    {
      onSuccess: (response, {code}) => {
        console.log('✅ 초대 수락 성공:', response);

        // 초대 수락 후 채팅방 목록 새로고침 (새로운 채팅방이 추가될 수 있음)
        queryClient.invalidateQueries({
          queryKey: ['participatedDmRooms'],
        });

        queryClient.invalidateQueries({
          queryKey: ['hostedDmRooms'],
        });

        // 메시지 목록들도 새로고침 (초대 상태 업데이트)
        queryClient.invalidateQueries({
          queryKey: ['dmMessages'],
        });

        // 해당 초대장의 상태 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: ['invitation-status', code],
        });

        // 모든 초대장 상태도 새로고침
        queryClient.invalidateQueries({
          queryKey: ['invitation-status'],
        });
      },
      onError: error => {
        console.error('❌ 초대 수락 실패:', error.message);
      },
    },
  );
};

/**
 * 초대장 상태 조회를 위한 React Query 훅
 * @param code 초대장 코드
 * @param enabled 쿼리 활성화 여부
 * @returns useQuery 훅의 반환값
 */
export const useGetInvitationStatus = (code: string, enabled = true) => {
  return useQuery({
    queryKey: ['invitation-status', code],
    queryFn: () => getInvitationStatus(code),
    enabled: enabled && !!code,
    staleTime: 30 * 1000, // 30초간 캐시 유지
    refetchInterval: 60 * 1000, // 1분마다 자동 새로고침
    retry: 2,
  });
};

/**
 * 그룹 채팅방 참여를 위한 React Query 뮤테이션 훅
 * @returns useMutation 훅의 반환값
 */
export const useJoinGroupChatRoom = () => {
  const queryClient = useQueryClient();

  return useApiMutation<JoinGroupChatRoomResponse, {meetingId: number}>(
    'joinGroupChatRoom',
    ({meetingId}) => joinGroupChatRoom(meetingId),
    {
      onSuccess: (response, {meetingId: _meetingId}) => {
        console.log('✅ 그룹 채팅방 참여 성공:', response);

        // 그룹 채팅방 목록 새로고침 (새로운 채팅방이 추가됨)
        queryClient.invalidateQueries({
          queryKey: ['groupChatRooms'],
        });

        // 새로 참여한 채팅방의 상세 정보 캐시에 추가
        if (response.data?.chatroom) {
          queryClient.setQueryData(
            [
              'groupChatRoomDetail',
              response.data.chatroom.groupChatroomId.toString(),
            ],
            {
              data: response.data.chatroom,
              success: true,
            },
          );
        }
      },
      onError: error => {
        console.error('❌ 그룹 채팅방 참여 실패:', error.message);
      },
    },
  );
};

/**
 * 모임 참가 여부 확인을 위한 React Query 훅
 * @param meetingId 모임 ID
 * @param userId 사용자 ID
 * @param enabled 쿼리 활성화 여부
 * @returns useQuery 훅의 반환값
 */
export const useCheckMeetingParticipation = (
  meetingId: number,
  userId: number,
  enabled = true,
) => {
  return useApiQuery<CheckParticipationResponse>(
    ['meeting-participation', meetingId.toString(), userId.toString()],
    () => checkMeetingParticipation(meetingId, userId),
    {
      enabled: enabled && meetingId > 0 && userId > 0,
      staleTime: 30 * 1000, // 30초간 캐시 유지
      refetchInterval: 2 * 60 * 1000, // 2분마다 자동 새로고침
      retry: 1,
    },
  );
};
