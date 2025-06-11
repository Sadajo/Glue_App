import {
  GuestBookThreadResponse,
  GuestBookResponse,
  CreateGuestBookRequest,
  UpdateGuestBookRequest,
  GetGuestBooksParams,
  GuestBookApiResponse,
  GuestBookItem,
} from '../model/guestbookTypes';
import {secureStorage} from '@shared/lib/security';
import axios from 'axios';
import {config} from '@/shared/config/env';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Axios 인스턴스 생성 (새로운 API용)
const guestbookApi = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
});

// 요청 인터셉터: 인증 토큰 추가
guestbookApi.interceptors.request.use(
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

// 공통 API 호출 함수
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // JWT 토큰 가져오기
  const token = await secureStorage.getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && {Authorization: `Bearer ${token}`}),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    }
    throw new Error(`API call failed: ${response.status}`);
  }

  const data = await response.json();
  return data.result; // BaseResponse<T>의 result 필드
}

// 새로운 API 스펙으로 방명록 조회
export async function getMyGuestBooks(
  hostId: number,
  cursorId?: number,
  pageSize: number = 10,
): Promise<GuestBookItem[]> {
  try {
    const params: any = {
      hostId: hostId.toString(),
      pageSize: pageSize.toString(),
    };

    if (cursorId) {
      params.cursorId = cursorId.toString();
    }

    const response = await guestbookApi.get<GuestBookApiResponse>(
      '/api/guestbooks',
      {
        params,
      },
    );

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(
        response.data.message || '방명록을 불러오는데 실패했습니다.',
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
        throw new Error('방명록을 찾을 수 없습니다.');
      } else if (status >= 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }

      const errorMessage =
        error.response.data?.message || '방명록을 불러오는데 실패했습니다.';
      throw new Error(errorMessage);
    }

    throw error;
  }
}

// 방명록 작성
export async function createGuestBook(
  request: CreateGuestBookRequest,
): Promise<GuestBookResponse> {
  return apiCall<GuestBookResponse>('/api/guestbooks', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// 방명록 조회 (커서 기반 페이징)
export async function getGuestBooks(
  params: GetGuestBooksParams,
): Promise<GuestBookThreadResponse[]> {
  const searchParams = new URLSearchParams({
    hostId: params.hostId.toString(),
    pageSize: (params.pageSize || 10).toString(),
  });

  if (params.cursorId) {
    searchParams.append('cursorId', params.cursorId.toString());
  }

  return apiCall<GuestBookThreadResponse[]>(
    `/api/guestbooks?${searchParams.toString()}`,
  );
}

// 방명록 개수 조회
export async function getGuestBookCount(hostId: number): Promise<number> {
  const searchParams = new URLSearchParams({
    hostId: hostId.toString(),
  });

  return apiCall<number>(`/api/guestbooks/count?${searchParams.toString()}`);
}

// 방명록 수정
export async function updateGuestBook(
  guestBookId: number,
  request: UpdateGuestBookRequest,
): Promise<GuestBookResponse> {
  return apiCall<GuestBookResponse>(`/api/guestbooks/${guestBookId}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

// 방명록 삭제
export async function deleteGuestBook(guestBookId: number): Promise<void> {
  return apiCall<void>(`/api/guestbooks/${guestBookId}`, {
    method: 'DELETE',
  });
}
