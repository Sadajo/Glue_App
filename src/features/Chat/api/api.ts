import axios from 'axios';
import {config} from '@/shared/config/env';
import {secureStorage} from '@/shared/lib/security';
import {ApiResponse} from '@/shared/lib/api/hooks';
import {apiClient} from '@/features/auth/api/api';

// DM 채팅방 다른 사용자 정보 타입
export interface DmChatRoomOtherUser {
  userId: number;
  userName: string;
  profileImageUrl: string | null;
}

// DM 채팅방 정보 타입
export interface DmChatRoom {
  dmChatRoomId: number;
  meetingId: number;
  otherUser: DmChatRoomOtherUser;
  lastMessage: string | null;
  lastMessageTime: string | null;
  hasUnreadMessages: boolean;
}

// 그룹 채팅방 미팅 정보 타입
export interface GroupChatRoomMeeting {
  meetingId: number;
  meetingTitle: string;
  meetingImageUrl: string;
  currentParticipants: number;
}

// 그룹 채팅방 정보 타입
export interface GroupChatRoom {
  groupChatroomId: number;
  meeting: GroupChatRoomMeeting;
  lastMessage: string | null;
  lastMessageTime: string | null;
  hasUnreadMessages: boolean;
}

// 그룹 메시지 발신자 정보 타입
export interface GroupMessageSender {
  userId: number;
  userNickname: string;
  profileImageUrl: string | null;
}

// 그룹 메시지 응답 타입
export interface GroupMessageResponse {
  groupMessageId: number;
  groupChatroomId: number;
  sender: GroupMessageSender;
  message: string;
  createdAt: string;
  // 입장/퇴장 메시지 필드 추가
  joinMessage?: {
    code: number;
    message: string;
  };
  leaveMessage?: {
    code: number;
    message: string;
  };
}

// 그룹 채팅방 참여자 타입 (실제 API 응답 구조)
export interface GroupChatRoomParticipant {
  user: {
    userId: number;
    userNickname: string;
    profileImageUrl: string | null;
  };
  isHost: boolean;
}

// 그룹 채팅방 상세 정보 타입
export interface GroupChatRoomDetail {
  groupChatroomId: number;
  meeting: GroupChatRoomMeeting;
  participants: GroupChatRoomParticipant[];
  pushNotificationOn: number;
  createdAt: string;
}

// 메시지 전송 요청 타입
export interface GroupMessageSendRequest {
  content: string;
}

// 채팅방 나가기 응답 타입
export interface GroupChatRoomLeaveResponse {
  code: number;
  message: string;
}

// 사용자 요약 정보 타입
export interface UserSummary {
  userId: number;
  userName: string;
  profileImageUrl: string | null;
}

// 호스트 정보가 포함된 사용자 요약 타입
export interface UserSummaryWithHostInfo extends UserSummary {
  isHost: boolean;
}

// DM 메시지 응답 타입
export interface DmMessageResponse {
  dmMessageId: number;
  dmChatRoomId: number;
  sender?: UserSummary; // 임시 메시지에서는 없을 수 있음
  senderId?: number; // 임시 메시지용 senderId
  content: string;
  isRead: number | boolean; // 0: 읽지 않음, 1: 읽음, boolean for temp messages
  createdAt: string;
}

// 실제 API 응답에서 사용되는 참가자 타입
export interface DmChatRoomParticipant {
  isHost: boolean;
  user: {
    userId: number;
    userNickname: string;
    profileImageUrl: string | null;
  };
}

// 실제 DM 채팅방 상세 정보 응답 타입 (실제 API 응답 구조)
export interface ActualDmChatRoomDetailResponse {
  dmChatRoomId: number;
  meetingId: number;
  postId: number;
  postTitle: string;
  participants: DmChatRoomParticipant[];
  isPushNotificationOn?: number;
  invitationStatus?: number;
  createdAt: string;
  updatedAt: string;
  isOtherUserDeleted?: boolean;
}

// DM 채팅방 상세 정보 응답 타입
export interface DmChatRoomDetailResponse {
  dmChatRoomId: number;
  meetingId: number;
  postId: number;
  postTitle: string;
  participants: UserSummaryWithHostInfo[];
  isPushNotificationOn?: number;
  invitationStatus?: number;
  createdAt: string;
  updatedAt: string;
  isOtherUserDeleted?: boolean;
}

// DM 메시지 전송 요청 타입
export interface DmMessageSendRequest {
  content: string;
}

// DM 메시지 읽음 요청 타입
export interface DmMessageReadRequest {
  receiverId: number;
}

// ============ 초대 관련 타입 정의 ============

// 초대 상태 enum
export enum InvitationStatus {
  PENDING = 0, // 대기중
  ACCEPTED = 1, // 수락됨
  EXPIRED = 2, // 만료됨
  REJECTED = 3, // 거절됨
}

// 초대장 생성 요청 타입
export interface InvitationCreateRequest {
  inviteeId: number;
}

// 초대장 생성 응답 타입
export interface InvitationCreateResponse {
  invitationId: number;
  code: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  status: number;
  meetingId: number;
  inviteeId: number;
}

// 초대장 수락 요청 타입
export interface InvitationAcceptRequest {
  code: string;
}

// 초대장 수락 응답 타입
export interface InvitationAcceptResponse {
  meetingId: number;
  message: string;
}

// 초대장 상태 조회 응답 타입
export interface InvitationStatusResponse {
  invitationId: number;
  code: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  status: number;
  meetingId: number;
  inviteeId: number;
}

// 그룹 채팅방 참여 응답 타입
export interface JoinGroupChatRoomResponse {
  chatroom: GroupChatRoomDetail;
  status: {
    code: number;
    message: string;
  };
}

// 모임 참가 여부 확인 응답 타입
export interface CheckParticipationResponse {
  isParticipating: boolean;
  message: string;
}

// 초대장 메시지 타입 (채팅 메시지에서 사용)
export interface InvitationMessage {
  type: 'invitation';
  invitationId: number;
  code: string;
  expiresAt: string;
  status: InvitationStatus;
  meetingId: number;
  inviteeId: number;
  inviteeName: string;
  senderName: string;
  maxUses?: number;
  usedCount?: number;
}

// 확장된 DM 메시지 타입 (초대 메시지 포함)
export interface ExtendedDmMessageResponse extends DmMessageResponse {
  messageType?: 'text' | 'invitation';
  invitationData?: InvitationMessage;
}

/**
 * 내가 호스트인 DM 채팅방 목록을 가져오는 API 함수
 * @returns API 응답 데이터
 */
export const getHostedDmRooms = async (): Promise<
  ApiResponse<DmChatRoom[]>
> => {
  const endpoint = '/api/dm/rooms/hosted';
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 호스트 DM 채팅방 목록 조회: ${url}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    console.log('[API 요청] 토큰 확인:', token ? '토큰 존재' : '토큰 없음');

    // API 요청 보내기
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('호스트 DM 채팅방 목록 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '',
    };
  } catch (error) {
    console.error('[API 오류] 호스트 DM 채팅방 목록 조회 실패:', error);

    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      console.log(`[API 오류] HTTP 상태: ${status}`);

      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('DM 채팅방 목록을 조회할 권한이 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || 'DM 채팅방 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 내가 참여자인 DM 채팅방 목록을 가져오는 API 함수
 * @returns API 응답 데이터
 */
export const getParticipatedDmRooms = async (): Promise<
  ApiResponse<DmChatRoom[]>
> => {
  const endpoint = '/api/dm/rooms/participated';
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 참여자 DM 채팅방 목록 조회: ${url}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('참여자 DM 채팅방 목록 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('DM 채팅방 목록을 조회할 권한이 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || 'DM 채팅방 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * DM 채팅방 상세 정보를 가져오는 API 함수
 * @param dmChatRoomId 채팅방 ID
 * @returns API 응답 데이터
 */
export const getDmChatRoomDetail = async (
  dmChatRoomId: number,
): Promise<ApiResponse<ActualDmChatRoomDetailResponse>> => {
  const endpoint = `/api/dm/rooms/${dmChatRoomId}`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] DM 채팅방 상세 정보 조회: ${url}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('DM 채팅방 상세 정보 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('채팅방 정보를 조회할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 채팅방입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message ||
        'DM 채팅방 상세 정보 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * DM 메시지 목록을 페이지네이션으로 가져오고 읽음 처리하는 API 함수
 * @param dmChatRoomId 채팅방 ID
 * @param cursorId 커서 ID (다음 페이지용, 첫 번째 페이지는 undefined)
 * @param pageSize 페이지 크기 (기본값 20)
 * @returns API 응답 데이터
 */
export const getDmMessages = async (
  dmChatRoomId: number,
  cursorId?: number,
  pageSize: number = 20,
): Promise<ApiResponse<DmMessageResponse[]>> => {
  const endpoint = `/api/dm/${dmChatRoomId}/all-messages`;

  // 쿼리 파라미터 구성
  const params = new URLSearchParams();
  if (cursorId !== undefined) {
    params.append('cursorId', cursorId.toString());
  }
  params.append('pageSize', pageSize.toString());

  const fullUrl = `${config.API_URL}${endpoint}?${params.toString()}`;
  console.log(`[API 요청] DM 메시지 목록 조회: ${fullUrl}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기 (PUT 메서드, 쿼리 파라미터 포함)
    const response = await apiClient.put(
      `${endpoint}?${params.toString()}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('DM 메시지 목록 응답:', response.data);
    console.log('📊 메시지 순서 확인 (첫 번째와 마지막):', {
      first: response.data?.[0]?.dmMessageId,
      last: response.data?.[response.data.length - 1]?.dmMessageId,
      count: response.data?.length,
    });

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('메시지를 조회할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 채팅방입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || 'DM 메시지 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * DM 메시지를 전송하는 API 함수
 * @param dmChatRoomId 채팅방 ID
 * @param content 메시지 내용
 * @returns API 응답 데이터
 */
export const sendDmMessage = async (
  dmChatRoomId: number,
  content: string,
): Promise<ApiResponse<DmMessageResponse>> => {
  const endpoint = `/api/dm/${dmChatRoomId}/send-message`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] DM 메시지 전송: ${url}`, {content});

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.post(
      endpoint,
      {content},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('DM 메시지 전송 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 400) {
        throw new Error('잘못된 요청입니다. 메시지 내용을 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('메시지를 전송할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 채팅방입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || 'DM 메시지 전송에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * DM 채팅방 알림 설정을 토글하는 API 함수
 * @param dmChatRoomId 채팅방 ID
 * @returns API 응답 데이터
 */
export const toggleDmChatRoomNotification = async (
  dmChatRoomId: number,
): Promise<ApiResponse<any>> => {
  const endpoint = `/api/dm/${dmChatRoomId}/toggle-push-notification`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] DM 채팅방 알림 설정 토글: ${url}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기 (body 없이 단순 PUT 요청)
    console.log('📤 요청 헤더:', `Bearer ${token}`);
    console.log('📤 요청 URL:', `${config.API_URL}${endpoint}`);

    const response = await apiClient.put(endpoint, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('📱 DM 채팅방 알림 설정 토글 전체 응답:', response);
    console.log('📱 응답 데이터:', response.data);
    console.log('📱 응답 상태 코드:', response.status);

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '알림 설정이 변경되었습니다.',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('알림 설정을 변경할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('채팅방을 찾을 수 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '알림 설정 변경에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 참여 중인 그룹 채팅방 목록을 가져오는 API 함수
 * @param cursorId 커서 ID (페이지네이션용)
 * @param pageSize 페이지 크기 (기본값: 10)
 * @returns API 응답 데이터
 */
export const getGroupChatRooms = async (
  cursorId?: number,
  pageSize: number = 10,
): Promise<ApiResponse<GroupChatRoom[]>> => {
  const endpoint = '/api/group/rooms/list';
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 그룹 채팅방 목록 조회: ${url}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    console.log(
      '[API 요청] 토큰 확인:',
      token ? `토큰 존재 (${token.substring(0, 20)}...)` : '토큰 없음',
    );

    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // 쿼리 파라미터 설정
    const params: any = {pageSize};
    if (cursorId !== undefined) {
      params.cursorId = cursorId;
    }

    console.log('[API 요청] 헤더 설정:', `Bearer ${token.substring(0, 20)}...`);

    // API 요청 보내기
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });

    console.log('그룹 채팅방 목록 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '',
    };
  } catch (error) {
    console.error('[API 오류] 그룹 채팅방 목록 조회 실패:', error);

    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      console.log(`[API 오류] HTTP 상태: ${status}`);
      console.log(`[API 오류] 응답 데이터:`, error.response.data);

      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('그룹 채팅방 목록을 조회할 권한이 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '그룹 채팅방 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 그룹 채팅방 메시지 목록을 가져오는 API 함수 (읽음 처리 포함)
 * @param groupChatroomId 그룹 채팅방 ID
 * @param cursorId 커서 ID (페이지네이션용)
 * @param pageSize 페이지 크기 (기본값: 20)
 * @returns API 응답 데이터
 */
export const getGroupMessages = async (
  groupChatroomId: number,
  cursorId?: number,
  pageSize: number = 20,
): Promise<ApiResponse<GroupMessageResponse[]>> => {
  const endpoint = `/api/group/${groupChatroomId}/all-messages`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 그룹 메시지 목록 조회: ${url}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // 쿼리 파라미터 설정
    const params = new URLSearchParams();
    params.append('pageSize', pageSize.toString());
    if (cursorId !== undefined) {
      params.append('cursorId', cursorId.toString());
    }

    // API 요청 보내기 (PUT 메서드, 쿼리 파라미터 포함)
    const response = await apiClient.put(
      `${endpoint}?${params.toString()}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('그룹 메시지 목록 응답:', response.data);
    console.log('📊 메시지 순서 확인 (첫 번째와 마지막):', {
      first: response.data?.[0]?.groupMessageId,
      last: response.data?.[response.data.length - 1]?.groupMessageId,
      count: response.data?.length,
    });

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('메시지를 조회할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 채팅방입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '그룹 메시지 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 그룹 채팅방 상세 정보를 가져오는 API 함수
 * @param groupChatroomId 그룹 채팅방 ID
 * @returns API 응답 데이터
 */
export const getGroupChatRoomDetail = async (
  groupChatroomId: number,
): Promise<ApiResponse<GroupChatRoomDetail>> => {
  const endpoint = `/api/group/rooms/${groupChatroomId}`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 그룹 채팅방 상세 정보 조회: ${url}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('그룹 채팅방 상세 정보 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('채팅방 정보를 조회할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 채팅방입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message ||
        '그룹 채팅방 상세 정보 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 그룹 메시지를 전송하는 API 함수
 * @param groupChatroomId 그룹 채팅방 ID
 * @param content 메시지 내용
 * @returns API 응답 데이터
 */
export const sendGroupMessage = async (
  groupChatroomId: number,
  content: string,
): Promise<ApiResponse<GroupMessageResponse>> => {
  const endpoint = `/api/group/${groupChatroomId}/send-message`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 그룹 메시지 전송: ${url}`, {content});

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.post(
      endpoint,
      {content},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('그룹 메시지 전송 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 400) {
        throw new Error('잘못된 요청입니다. 메시지 내용을 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('메시지를 전송할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 채팅방입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '그룹 메시지 전송에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 그룹 채팅방 알림 설정을 토글하는 API 함수
 * @param groupChatroomId 그룹 채팅방 ID
 * @returns API 응답 데이터
 */
export const toggleGroupChatRoomNotification = async (
  groupChatroomId: number,
): Promise<ApiResponse<number>> => {
  const endpoint = `/api/group/${groupChatroomId}/toggle-push-notification`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 그룹 채팅방 알림 설정 토글: ${url}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.put(endpoint, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('그룹 채팅방 알림 설정 토글 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '알림 설정이 변경되었습니다.',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('알림 설정을 변경할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 채팅방입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '알림 설정 변경에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 그룹 채팅방을 나가는 API 함수
 * @param groupChatroomId 그룹 채팅방 ID
 * @returns API 응답 데이터
 */
export const leaveGroupChatRoom = async (
  groupChatroomId: number,
): Promise<ApiResponse<GroupChatRoomLeaveResponse[]>> => {
  const endpoint = `/api/group/rooms/${groupChatroomId}/leave`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 그룹 채팅방 나가기: ${url}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.delete(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('그룹 채팅방 나가기 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data,
      success: true,
      message: '채팅방에서 나갔습니다.',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('채팅방을 나갈 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 채팅방입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '채팅방 나가기에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

// ============ 초대 관련 API 함수 ============

/**
 * 모임 초대장을 생성하는 API 함수
 * @param meetingId 모임 ID
 * @param inviteeId 초대받을 사용자 ID
 * @returns API 응답 데이터
 */
export const createMeetingInvitation = async (
  meetingId: number,
  inviteeId: number,
): Promise<ApiResponse<InvitationCreateResponse>> => {
  const endpoint = `/api/invitations/meeting/${meetingId}`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 모임 초대장 생성: ${url}`, {inviteeId});

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.post(
      endpoint,
      {inviteeId},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('모임 초대장 생성 응답:', response.data);

    // 서버 응답 처리
    if (response.data.isSuccess) {
      return {
        data: response.data.result,
        success: true,
        message: response.data.message || '초대장이 생성되었습니다.',
      };
    } else {
      throw new Error(response.data.message || '초대장 생성에 실패했습니다.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 400) {
        throw new Error('잘못된 요청입니다. 초대 정보를 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('초대장을 생성할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 모임이거나 사용자입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '초대장 생성에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 모임 초대장을 수락하는 API 함수
 * @param code 초대 코드
 * @returns API 응답 데이터
 */
export const acceptInvitation = async (
  code: string,
): Promise<ApiResponse<InvitationAcceptResponse>> => {
  const endpoint = '/api/invitations/accept';
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 초대장 수락: ${url}`, {code});

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.post(
      endpoint,
      {code},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('초대장 수락 응답:', response.data);

    // 서버 응답 처리
    if (response.data.isSuccess) {
      return {
        data: response.data.result || {},
        success: true,
        message: response.data.message || '초대를 수락했습니다.',
      };
    } else {
      throw new Error(response.data.message || '초대 수락에 실패했습니다.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 400) {
        throw new Error('잘못된 초대 코드입니다.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('초대를 수락할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않거나 만료된 초대입니다.');
      } else if (status === 409) {
        throw new Error('이미 수락되었거나 사용된 초대입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '초대 수락에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 초대장 상태 조회 API 함수
 * @param code 초대장 코드
 * @returns API 응답 데이터
 */
export const getInvitationStatus = async (
  code: string,
): Promise<ApiResponse<InvitationStatusResponse>> => {
  const endpoint = `/api/invitations/status/${code}`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 초대장 상태 조회: ${url}`);

  try {
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('초대장 상태 조회 응답:', response.data);

    if (response.data.isSuccess) {
      return {
        data: response.data.result,
        success: true,
        message: response.data.message || '',
      };
    } else {
      throw new Error(
        response.data.message || '초대장 상태 조회에 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 400) {
        throw new Error('잘못된 초대 코드입니다.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 초대장입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response?.data?.message || '초대장 상태 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 그룹 채팅방 참여 API 함수
 * @param meetingId 모임 ID
 * @returns API 응답 데이터
 */
export const joinGroupChatRoom = async (
  meetingId: number,
): Promise<ApiResponse<JoinGroupChatRoomResponse>> => {
  const endpoint = `/api/group/rooms/create/${meetingId}`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 그룹 채팅방 참여: ${url}`, {meetingId});

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('그룹 채팅방 참여 응답:', response.data);

    // 서버 응답 처리
    if (response.data) {
      return {
        data: response.data,
        success: true,
        message: '그룹 채팅방에 참여했습니다.',
      };
    } else {
      throw new Error('그룹 채팅방 참여에 실패했습니다.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 400) {
        throw new Error('잘못된 요청입니다. 모임 정보를 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('채팅방에 참여할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 모임입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response?.data?.message || '그룹 채팅방 참여에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 모임 참가 여부 확인 API 함수
 * @param meetingId 모임 ID
 * @param userId 사용자 ID
 * @returns API 응답 데이터
 */
export const checkMeetingParticipation = async (
  meetingId: number,
  userId: number,
): Promise<ApiResponse<CheckParticipationResponse>> => {
  const endpoint = `/api/invitations/check-participation/${meetingId}/${userId}`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 모임 참가 여부 확인: ${url}`, {meetingId, userId});

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('모임 참가 여부 확인 응답:', response.data);

    // 서버 응답 처리
    if (response.data.isSuccess) {
      return {
        data: response.data.result,
        success: true,
        message: response.data.message || '참가 여부 확인 완료',
      };
    } else {
      throw new Error(
        response.data.message || '참가 여부 확인에 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 400) {
        throw new Error(
          '잘못된 요청입니다. 모임 또는 사용자 정보를 확인해주세요.',
        );
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 모임이거나 사용자입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response?.data?.message || '참가 여부 확인에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 그룹 채팅방 참여 API 함수
 * @param meetingId 모임 ID
 * @returns API 응답 데이터
 */
export const joinGroupChatRoomByMeetingId = async (
  meetingId: number,
): Promise<ApiResponse<JoinGroupChatRoomResponse>> => {
  const endpoint = `/api/group/rooms/create/${meetingId}`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 그룹 채팅방 참여: ${url}`, {meetingId});

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('그룹 채팅방 참여 응답:', response.data);

    // 서버 응답 처리
    if (response.data) {
      return {
        data: response.data,
        success: true,
        message: '그룹 채팅방에 참여했습니다.',
      };
    } else {
      throw new Error('그룹 채팅방 참여에 실패했습니다.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 400) {
        throw new Error('잘못된 요청입니다. 모임 정보를 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('채팅방에 참여할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 모임입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response?.data?.message || '그룹 채팅방 참여에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};
