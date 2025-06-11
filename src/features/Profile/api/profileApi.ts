import axios from 'axios';
import {config} from '@/shared/config/env';
import {secureStorage} from '@shared/lib/security';

// API 응답 타입 정의
export interface MyPageResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    profileImageUrl: string;
    userNickname: string;
    description: string;
    mainLanguage: number;
    mainLanguageLevel: number;
    learningLanguage: number;
    learningLanguageLevel: number;
  };
}

// 새로운 프로필 API 응답 타입 (실제 API 스펙에 맞춤)
export interface ProfileMeResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    userId: number;
    profileImageUrl: string;
    description: string;
    realName: string;
    nickName: string;
    birthDate: string;
    gender: number;
    systemLanguage: number;
    school: number;
    major: number;
    email: string;
  };
}

// 타인 프로필 조회 API 응답 타입
export interface UserProfileResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    userId: number;
    profileImageUrl: string;
    nickName: string;
    description: string;
    gender: number;
    birthDate: string;
    school: number;
    mainLanguage: number;
    mainLanguageLevel: number;
    learningLanguage: number;
    learningLanguageLevel: number;
    major: number;
  };
}

// 공개 범위 설정 관련 타입 정의
export interface VisibilityResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    currentMajorVisibility: number;
    currentMeetingHistoryVisibility: number;
    currentLikeListVisibility: number;
    currentGuestBookVisibility: number;
  };
}

export interface VisibilityUpdateResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {};
}

// 좋아요 목록 조회 API 응답 타입
export interface LikesResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    posts: Array<{
      postId: number;
      viewCount: number;
      categoryId: number;
      title: string;
      content: string;
      likeCount: number;
      currentParticipants: number;
      maxParticipants: number;
      createdAt: string;
      thumbnailUrl: string;
    }>;
  };
}

// 모임 히스토리 조회 API 응답 타입
export interface MeetingsHistoryResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    hostedMeetings: Array<{
      postId: number;
      meetingThumbnail: string;
      meetingTitle: string;
      categoryId: number;
    }>;
    joinedMeetings: Array<{
      postId: number;
      meetingThumbnail: string;
      meetingTitle: string;
      categoryId: number;
    }>;
  };
}

// 내가 참여 중인 모임 조회 API 응답 타입
export interface MyMeetingsResponse {
  httpStatus: {
    error: boolean;
    is3xxRedirection: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is2xxSuccessful: boolean;
    is1xxInformational: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    hostedMeetings: Array<{
      meetingId: number;
      meetingTitle: string;
      meetingImageUrl: string;
      currentParticipants: number;
    }>;
    joinedMeetings: Array<{
      meetingId: number;
      meetingTitle: string;
      meetingImageUrl: string;
      currentParticipants: number;
    }>;
  };
}

// Axios 인스턴스 생성
const profileApi = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
});

// 요청 인터셉터: 인증 토큰 추가
profileApi.interceptors.request.use(
  async config => {
    try {
      const token = await secureStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 마이페이지 정보 조회 API
export const getMyPageInfo = async (): Promise<MyPageResponse['result']> => {
  try {
    const response = await profileApi.get<MyPageResponse>('/api/users/my-page');

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(
        response.data.message || '마이페이지 정보를 가져오는데 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 404) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message ||
        '마이페이지 정보를 가져오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 본인 프로필 조회 API (실제 API 스펙에 맞춤)
export const getProfileMe = async (): Promise<ProfileMeResponse['result']> => {
  try {
    const response = await profileApi.get<ProfileMeResponse>(
      '/api/users/profile/me',
    );

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(
        response.data.message || '프로필 정보를 가져오는데 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 404) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message ||
        '프로필 정보를 가져오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 타인 프로필 조회 API
export const getUserProfile = async (
  userId: number,
): Promise<UserProfileResponse['result']> => {
  try {
    const response = await profileApi.get<UserProfileResponse>(
      `/api/users/profile/${userId}`,
    );

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(
        response.data.message ||
          '사용자 프로필 정보를 가져오는데 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 404) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message ||
        '사용자 프로필 정보를 가져오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 한 줄 소개 수정 API
export const updateDescription = async (description: string): Promise<any> => {
  try {
    const response = await profileApi.post('/api/users/description', {
      description,
    });

    if (response.data.isSuccess) {
      return response.data;
    } else {
      throw new Error(
        response.data.message || '한 줄 소개 수정에 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message || '한 줄 소개 수정에 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 공개 범위 설정 조회 API
export const getVisibilitySettings = async (): Promise<
  VisibilityResponse['result']
> => {
  try {
    const response = await profileApi.get<VisibilityResponse>(
      '/api/users/visibility',
    );

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(
        response.data.message || '공개 범위 설정을 가져오는데 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message ||
        '공개 범위 설정을 가져오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 학과 공개여부 설정 API
export const updateMajorVisibility = async (
  currentVisible: number,
): Promise<void> => {
  try {
    const response = await profileApi.put<VisibilityUpdateResponse>(
      `/api/users/major-visibility?currentVisible=${currentVisible}`,
    );

    if (!response.data.isSuccess) {
      throw new Error(
        response.data.message || '학과 공개 설정에 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message || '학과 공개 설정에 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 모임 히스토리 공개여부 설정 API
export const updateMeetingHistoryVisibility = async (
  currentVisible: number,
): Promise<void> => {
  try {
    const response = await profileApi.put<VisibilityUpdateResponse>(
      `/api/users/meeting-history-visibility?currentVisible=${currentVisible}`,
    );

    if (!response.data.isSuccess) {
      throw new Error(
        response.data.message || '모임 히스토리 공개 설정에 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message ||
        '모임 히스토리 공개 설정에 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 좋아요 목록 공개여부 설정 API
export const updateLikeListVisibility = async (
  currentVisible: number,
): Promise<void> => {
  try {
    const response = await profileApi.put<VisibilityUpdateResponse>(
      `/api/users/like-list-visibility?currentVisible=${currentVisible}`,
    );

    if (!response.data.isSuccess) {
      throw new Error(
        response.data.message || '좋아요 목록 공개 설정에 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message || '좋아요 목록 공개 설정에 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 방명록 공개여부 설정 API
export const updateGuestbookVisibility = async (
  currentVisible: number,
): Promise<void> => {
  try {
    const response = await profileApi.put<VisibilityUpdateResponse>(
      `/api/users/guestbook-visibility?currentVisible=${currentVisible}`,
    );

    if (!response.data.isSuccess) {
      throw new Error(
        response.data.message || '방명록 공개 설정에 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message || '방명록 공개 설정에 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 좋아요 목록 조회 API
export const getUserLikes = async (
  targetUserId: number,
): Promise<LikesResponse['result']> => {
  try {
    const response = await profileApi.get<LikesResponse>(
      `/api/users/likes?targetUserId=${targetUserId}`,
    );

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(
        response.data.message || '좋아요 목록을 가져오는데 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 404) {
        throw new Error('좋아요 목록을 찾을 수 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message ||
        '좋아요 목록을 가져오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 모임 히스토리 조회 API
export const getMeetingsHistory = async (
  targetUserId: number,
): Promise<MeetingsHistoryResponse['result']> => {
  try {
    const response = await profileApi.get<MeetingsHistoryResponse>(
      `/api/users/meetings-history?targetUserId=${targetUserId}`,
    );

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(
        response.data.message || '모임 히스토리를 가져오는데 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 404) {
        throw new Error('모임 히스토리를 찾을 수 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message ||
        '모임 히스토리를 가져오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};

// 내가 참여 중인 모임 조회 API
export const getMyMeetings = async (): Promise<MyMeetingsResponse['result']> => {
  try {
    const response = await profileApi.get<MyMeetingsResponse>('/api/meetings/my');

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(
        response.data.message || '참여 중인 모임을 가져오는데 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error('네트워크 연결에 문제가 있습니다.');
      }

      const status = error.response.status;
      if (status === 401) {
        throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (status === 404) {
        throw new Error('참여 중인 모임을 찾을 수 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message ||
        '참여 중인 모임을 가져오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
};
