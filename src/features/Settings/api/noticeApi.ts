import axios from 'axios';
import {config} from '@/shared/config/env';
import {ApiResponse} from '@/shared/lib/api/hooks';

// Axios 인스턴스 생성
const noticeApi = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
});

// 요청 인터셉터: 인증 토큰 추가
noticeApi.interceptors.request.use(
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

// 공지사항 타입
export interface NoticeDto {
  noticeId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  imageUrls?: string[];
}

// 서버 응답 타입
export interface ApiResponseDto<T> {
  httpStatus: string;
  isSuccess: boolean;
  message: string;
  result: T;
}

// 공지사항 목록 조회 파라미터
export interface GetNoticesParams {
  cursorId?: number;
  pageSize?: number;
}

// 공지사항 목록 조회 API
export const getNotices = async (
  params: GetNoticesParams = {},
): Promise<ApiResponse<NoticeDto[]>> => {
  const endpoint = '/api/notice';

  try {
    const response = await noticeApi.get<ApiResponseDto<NoticeDto[]>>(
      endpoint,
      {
        params: {
          cursorId: params.cursorId,
          pageSize: params.pageSize || 10,
        },
      },
    );

    console.log('공지사항 목록 조회 서버 응답:', response.data);

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
        error.response.data?.message || '공지사항을 불러오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};

// 공지사항 상세 조회 API
export const getNotice = async (
  noticeId: number,
): Promise<ApiResponse<NoticeDto>> => {
  const endpoint = `/api/notice/${noticeId}`;

  try {
    const response = await noticeApi.get<ApiResponseDto<NoticeDto>>(endpoint);

    console.log('공지사항 상세 조회 서버 응답:', response.data);

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
      } else if (status === 404) {
        throw new Error('공지사항을 찾을 수 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      // 기본 에러 메시지
      const errorMessage =
        error.response.data?.message || '공지사항을 불러오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    // 기타 에러
    throw error;
  }
};
