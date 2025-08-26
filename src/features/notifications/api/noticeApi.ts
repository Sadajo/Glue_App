import axios from 'axios';
import {config} from '@/shared/config/env';
import {ApiResponse} from '@/shared/lib/api/hooks';

// Axios 인스턴스 생성
const notificationApi = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
});

// 요청 인터셉터: 인증 토큰 추가
notificationApi.interceptors.request.use(
  async config => {
    try {
      const {secureStorage} = await import('@shared/lib/security');
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

// 알림 타입
export interface NotificationDto {
  notificationId: number;
  type: string;
  title: string;
  content: string;
  targetId: number;
  hostId: number;
  createdAt: string;
}

// 서버 응답 타입
export interface ApiResponseDto<T> {
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
  result: T;
}

// 알림 목록 조회 파라미터
export interface GetNotificationsParams {
  cursorId?: number;
  pageSize?: number;
  isNoticeTab?: boolean;
}

// 알림 목록 조회 API
export const getNotifications = async (
  params: GetNotificationsParams = {},
): Promise<ApiResponse<NotificationDto[]>> => {
  const endpoint = '/api/notification';

  try {
    const response = await notificationApi.get<
      ApiResponseDto<NotificationDto[]>
    >(endpoint, {
      params: {
        cursorId: params.cursorId,
        pageSize: params.pageSize || 10,
        isNoticeTab: params.isNoticeTab || false,
      },
    });

    console.log('알림 목록 조회 서버 응답:', response.data);

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
        throw new Error('접근 권한이 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '알림을 불러오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};
