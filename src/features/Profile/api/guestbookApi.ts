import {
  GuestBookThreadResponse,
  GuestBookResponse,
  CreateGuestBookRequest,
  UpdateGuestBookRequest,
  GetGuestBooksParams,
} from '../model/guestbookTypes';
import {secureStorage} from '@shared/lib/security';
import axios from 'axios';
import {config} from '@/shared/config/env';

// Axios 인스턴스 생성
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

// 응답 인터셉터: 에러 처리
guestbookApi.interceptors.response.use(
  response => response,
  error => {
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
        error.response.data?.message || '요청 처리에 실패했습니다.';
      throw new Error(errorMessage);
    }
    throw error;
  },
);

// 방명록 작성
export async function createGuestBook(
  request: CreateGuestBookRequest,
): Promise<GuestBookResponse> {
  try {
    const response = await guestbookApi.post<{result: GuestBookResponse}>(
      '/api/guestbooks',
      request,
    );

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(response.data.message || '방명록 작성에 실패했습니다.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('방명록 작성에 실패했습니다.');
  }
}

// 방명록 조회 (커서 기반 페이징)
export async function getGuestBooks(
  params: GetGuestBooksParams,
): Promise<GuestBookThreadResponse[]> {
  try {
    const queryParams: any = {
      hostId: params.hostId.toString(),
      pageSize: (params.pageSize || 10).toString(),
    };

    if (params.cursorId) {
      queryParams.cursorId = params.cursorId.toString();
    }

    const response = await guestbookApi.get<{
      result: GuestBookThreadResponse[];
    }>('/api/guestbooks', {
      params: queryParams,
    });

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(
        response.data.message || '방명록을 불러오는데 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('방명록을 불러오는데 실패했습니다.');
  }
}

// 방명록 개수 조회
export async function getGuestBookCount(hostId: number): Promise<number> {
  try {
    const response = await guestbookApi.get<{result: number}>(
      '/api/guestbooks/count',
      {
        params: {
          hostId: hostId.toString(),
        },
      },
    );

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(
        response.data.message || '방명록 개수를 불러오는데 실패했습니다.',
      );
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('방명록 개수를 불러오는데 실패했습니다.');
  }
}

// 방명록 수정
export async function updateGuestBook(
  guestBookId: number,
  request: UpdateGuestBookRequest,
): Promise<GuestBookResponse> {
  try {
    const response = await guestbookApi.put<{result: GuestBookResponse}>(
      `/api/guestbooks/${guestBookId}`,
      request,
    );

    if (response.data.isSuccess) {
      return response.data.result;
    } else {
      throw new Error(response.data.message || '방명록 수정에 실패했습니다.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('방명록 수정에 실패했습니다.');
  }
}

// 방명록 삭제
export async function deleteGuestBook(guestBookId: number): Promise<void> {
  try {
    const response = await guestbookApi.delete<{result: void}>(
      `/api/guestbooks/${guestBookId}`,
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || '방명록 삭제에 실패했습니다.');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error;
    }
    throw new Error('방명록 삭제에 실패했습니다.');
  }
}
