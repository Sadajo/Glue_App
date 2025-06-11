import axios from 'axios';
import {ApiResponse} from '@/shared/lib/api/hooks';
import {config} from '@/shared/config/env';
import {secureStorage} from '@/shared/lib/security';
import {apiClient} from '@/features/auth/api/api';

// 모임 게시글 생성 요청 타입
export interface CreateGroupPostRequest {
  meeting: {
    meetingTitle: string;
    categoryId: number;
    meetingPlaceName: string;
    meetingTime: string; // 'yyyy-MM-dd'T'HH:mm:ss' 형식
    mainLanguageId: number;
    exchangeLanguageId: number;
    maxParticipants: number;
  };
  post: {
    title: string;
    content: string;
    imageUrls?: string[];
  };
}

// 모임 게시글 생성 응답 타입
export interface CreateGroupPostResponse {
  postId: number;
  meetingId: number;
}

// 게시글 목록 아이템 타입 (서버 DTO에 맞춤)
export interface PostItem {
  postId: number;
  viewCount: number;
  categoryId: number;
  title: string;
  content: string;
  likeCount: number;
  currentParticipants: number;
  maxParticipants: number;
  createdAt: string;
  thumbnailUrl: string | null;
}

// 게시글 목록 응답 타입 (서버 DTO에 맞춤)
export interface GetPostsResponse {
  hasNext: boolean;
  posts: PostItem[];
}

// 게시글 목록 요청 파라미터 타입
export interface GetPostsParams {
  lastPostId?: number;
  size?: number;
  categoryId?: number;
}

// 모임 상세 응답 타입 (새로운 API 구조에 맞춰 확장)
export interface GetPostResponse {
  meeting: {
    meetingTitle: string;
    categoryId: number;
    meetingPlaceName: string;
    meetingTime: string;
    mainLanguageId: number;
    exchangeLanguageId: number;
    maxParticipants: number;
    // 기존 필드들 (하위 호환성을 위해 유지)
    meetingId?: number;
    creator?: {
      userId: number;
      userNickname: string;
      profileImageUrl: string | null;
    };
    currentParticipants?: number;
    languageId?: number;
    meetingStatus?: number;
    participants?: Array<{
      userId: number;
      nickname: string;
      profileImageUrl: string | null;
    }>;
    createdAt?: string;
    updatedAt?: string;
  };
  post: {
    title: string;
    content: string;
    imageUrls: string[];
    // 좋아요 기능을 위한 필수 필드들 추가
    postId: number;
    likeCount: number;
    isLiked: boolean;
    // 기존 필드들 (하위 호환성을 위해 유지)
    viewCount?: number;
    bumpedAt?: string | null;
    postImageUrl?: Array<{
      postImageId: number;
      imageUrl: string;
      imageOrder: number;
    }>;
  };
}

// DM 채팅방 생성 요청 타입
export interface DmChatRoomCreateRequest {
  meetingId: number;
  userIds: number[]; // 초대할 사용자 ID 목록
}

// DM 채팅방 참가자 타입
export interface DmChatRoomParticipant {
  userId: number;
  userName: string;
  profileImageUrl: string | null;
}

// DM 채팅방 생성 응답 상세 타입
export interface DmChatRoomDetail {
  dmChatRoomId: number;
  meetingId: number;
  participants: DmChatRoomParticipant[];
  createdAt: string;
  updatedAt: string;
}

// DM 채팅방 생성 응답 상태 타입
export interface DmChatRoomStatus {
  code: number;
  message: string;
}

// DM 채팅방 생성 응답 타입
export interface DmChatRoomCreateResult {
  detail: DmChatRoomDetail;
  status: DmChatRoomStatus;
}

// 신고하기 요청 타입
export interface ReportRequest {
  reportedId: number;
  reasonId: number;
}

// 신고하기 응답 타입
export interface ReportResponse {
  reportId: number;
  message: string;
}

// 기존 게시글 신고 요청 타입 (호환성을 위해 유지)
export interface ReportPostRequest {
  postId: number;
  reason: string;
}

// 기존 게시글 신고 응답 타입 (호환성을 위해 유지)
export interface ReportPostResponse {
  reportId: number;
  message: string;
}

// 그룹 채팅방 참여자 타입
export interface GroupChatParticipant {
  [key: string]: any; // 참여자 정보는 서버에서 정의된 구조에 따라 달라질 수 있음
}

// 그룹 채팅방 미팅 정보 타입
export interface GroupChatMeeting {
  meetingId: number;
  meetingTitle: string;
  meetingImageUrl: string;
  currentParticipants: number;
}

// 그룹 채팅방 정보 타입
export interface GroupChatRoom {
  groupChatroomId: number;
  meeting: GroupChatMeeting;
  participants: GroupChatParticipant;
  createdAt: string;
  pushNotificationOn: number;
}

// 그룹 채팅방 상태 타입
export interface GroupChatStatus {
  code: number;
  message: string;
}

// 그룹 채팅방 참여 응답 타입
export interface GroupChatJoinResponse {
  chatroom: GroupChatRoom;
  status: GroupChatStatus;
}

/**
 * 모임 게시글 목록을 가져오는 API 함수
 * @param params 게시글 목록 요청 파라미터
 * @returns API 응답 데이터
 */
export const getPosts = async (
  params?: GetPostsParams,
): Promise<ApiResponse<GetPostsResponse>> => {
  const endpoint = '/api/posts';
  const url = `${config.API_URL}${endpoint}`;

  // 쿼리 파라미터 구성
  const queryParams: Record<string, string> = {};
  if (params?.lastPostId !== undefined) {
    queryParams.lastPostId = params.lastPostId.toString();
  }
  if (params?.size !== undefined) {
    queryParams.size = params.size.toString();
  }
  if (params?.categoryId !== undefined) {
    queryParams.categoryId = params.categoryId.toString();
  }

  console.log(`[API 요청] 모임 게시글 목록 조회: ${url}`, queryParams);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.get(endpoint, {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('모임 게시글 목록 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data.result,
      success: response.data.isSuccess,
      message: response.data.message || '',
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
        throw new Error('모임 게시글 목록을 조회할 권한이 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '모임 게시글 목록 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 모임 게시글을 생성하는 API 함수
 * @param data 모임 게시글 생성 요청 데이터
 * @returns API 응답 데이터
 */
export const createGroupPost = async (
  data: CreateGroupPostRequest,
): Promise<ApiResponse<CreateGroupPostResponse>> => {
  const endpoint = '/api/posts';
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 모임 게시글 생성: ${url}`, data);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.post(endpoint, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('모임 게시글 생성 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data.result,
      success: response.data.isSuccess,
      message: response.data.message || '',
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
        throw new Error('잘못된 요청입니다. 입력 정보를 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('모임 게시글을 생성할 권한이 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '모임 게시글 생성에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 모임 상세 정보를 가져오는 API 함수
 * @param postId 모임 게시글 ID
 * @returns API 응답 데이터
 */
export const getGroupDetail = async (
  postId: number,
): Promise<ApiResponse<GetPostResponse>> => {
  const endpoint = `/api/posts/${postId}`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 모임 상세 정보 조회: ${url}`);

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

    console.log('모임 상세 정보 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data.result,
      success: response.data.isSuccess,
      message: response.data.message || '',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 404) {
        throw new Error('존재하지 않는 모임입니다.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('모임 상세 정보를 조회할 권한이 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '모임 상세 정보 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 모임에 참여하는 API 함수
 * @param meetingId 참여할 모임 ID
 * @returns API 응답 데이터
 */
export const joinGroup = async (
  meetingId: number,
): Promise<ApiResponse<boolean>> => {
  const endpoint = `/api/meetings/${meetingId}/participants`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 모임 참여: ${url}`);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.post(
      endpoint,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('모임 참여 응답:', response.data);

    // 서버 응답 처리
    return {
      data: true,
      success: response.data.isSuccess,
      message: response.data.message || '',
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
        throw new Error('잘못된 요청입니다. 입력 정보를 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('모임에 참여할 권한이 없습니다.');
      } else if (status === 409) {
        throw new Error('이미 참여한 모임입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '모임 참여에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

// 좋아요 토글 응답 타입
export interface LikeToggleResponse {
  isLiked: boolean;
  likeCount: number;
}

/**
 * 게시글 좋아요를 토글하는 API 함수
 * @param postId 게시글 ID
 * @returns API 응답 데이터
 */
export const toggleLike = async (
  postId: number,
): Promise<ApiResponse<LikeToggleResponse>> => {
  const endpoint = `/api/posts/${postId}/like`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 좋아요 토글: ${url}`);

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

    console.log('좋아요 토글 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data.result,
      success: response.data.isSuccess,
      message: response.data.message || '',
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
        throw new Error('잘못된 요청입니다.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('좋아요 기능을 사용할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 게시글입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '좋아요 처리에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 게시글을 끌어올리는 API 함수
 * @param postId 게시글 ID
 * @returns API 응답 데이터
 */
export const bumpPost = async (postId: number): Promise<ApiResponse<void>> => {
  const endpoint = `/api/posts/${postId}/bump`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 게시글 끌어올리기: ${url}`);

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

    console.log('게시글 끌어올리기 응답:', response.data);

    // 서버 응답 처리
    return {
      data: undefined,
      success: response.data.isSuccess,
      message: response.data.message || '',
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
        throw new Error('잘못된 요청입니다.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('이 게시글을 끌어올릴 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 게시글입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '게시글 끌어올리기에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * DM 채팅방을 생성하는 API 함수
 * @param data DM 채팅방 생성 요청 데이터
 * @returns API 응답 데이터
 */
export const createDmChatRoom = async (
  data: DmChatRoomCreateRequest,
): Promise<ApiResponse<DmChatRoomCreateResult>> => {
  const endpoint = '/api/dm/rooms/create';
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] DM 채팅방 생성: ${url}`, data);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.post(endpoint, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('DM 채팅방 생성 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data,
      success:
        response.data.status.code === 200 || response.data.status.code === 201,
      message: response.data.status.message || '',
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
        throw new Error('잘못된 요청입니다. 입력 정보를 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('채팅방을 생성할 권한이 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || 'DM 채팅방 생성에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 새로운 신고 API 함수
 * @param data 신고하기 요청 데이터
 * @returns API 응답 데이터
 */
export const report = async (
  data: ReportRequest,
): Promise<ApiResponse<ReportResponse>> => {
  const endpoint = '/api/report';
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 신고: ${url}`, data);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.post(endpoint, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('신고 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data.result,
      success: response.data.isSuccess,
      message: response.data.message || '',
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
        throw new Error('잘못된 신고 요청입니다. 입력 정보를 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('신고할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 대상입니다.');
      } else if (status === 409) {
        throw new Error('이미 신고한 대상입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '신고에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 게시글을 신고하는 API 함수 (기존 호환성을 위해 유지)
 * @param data 신고하기 요청 데이터
 * @returns API 응답 데이터
 */
export const reportPost = async (
  data: ReportPostRequest,
): Promise<ApiResponse<ReportPostResponse>> => {
  const endpoint = `/api/posts/${data.postId}/report`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 게시글 신고: ${url}`, data);

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // API 요청 보내기
    const response = await apiClient.post(
      endpoint,
      {reason: data.reason},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log('게시글 신고 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data.result,
      success: response.data.isSuccess,
      message: response.data.message || '',
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
        throw new Error('잘못된 신고 요청입니다. 입력 정보를 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('신고할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 게시글입니다.');
      } else if (status === 409) {
        throw new Error('이미 신고한 게시글입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '게시글 신고에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

// 모임 상세 정보 응답 타입 (API 문서 기준)
export interface MeetingDetailResponse {
  invitationId: number;
  code: string;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  status: number;
  meetingId: number;
  inviteeId: number;
}

/**
 * 모임 상세 정보를 가져오는 API 함수 (API 문서 기준)
 * @param meetingId 모임 ID
 * @returns API 응답 데이터
 */
export const getMeetingDetail = async (
  meetingId: number,
): Promise<ApiResponse<MeetingDetailResponse>> => {
  const endpoint = `/api/meetings/${meetingId}`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 모임 상세 조회: ${url}`);

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

    console.log('모임 상세 조회 응답:', response.data);

    // 서버 응답 처리
    return {
      data: response.data.result,
      success: response.data.isSuccess,
      message: response.data.message || '',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // 네트워크 오류
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      // HTTP 상태 코드별 에러 처리
      const status = error.response.status;
      if (status === 404) {
        throw new Error('존재하지 않는 모임입니다.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('모임 정보를 조회할 권한이 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '모임 상세 조회에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

/**
 * 그룹 채팅방에 참여하는 API 함수
 * @param meetingId 미팅 ID
 * @returns API 응답 데이터
 */
export const joinGroupChatRoom = async (
  meetingId: number,
): Promise<ApiResponse<GroupChatJoinResponse>> => {
  const endpoint = `/api/group/rooms/create/${meetingId}`;
  const url = `${config.API_URL}${endpoint}`;
  console.log(`[API 요청] 그룹 채팅방 참여: ${url}`);

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
    return {
      data: response.data,
      success: response.data.status.code === 200,
      message: response.data.status.message || '',
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
        throw new Error('잘못된 요청입니다. 미팅 ID를 확인해주세요.');
      } else if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('그룹 채팅방에 참여할 권한이 없습니다.');
      } else if (status === 404) {
        throw new Error('존재하지 않는 미팅입니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '그룹 채팅방 참여에 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};
