import axios from 'axios';
import {config} from '@shared/config/env';

// 프로필 이미지 업데이트 요청 타입
export interface UpdateProfileImageRequest {
  profileImageUrl: string;
}

// API 응답 타입
export interface ApiResponse<T> {
  httpStatus: {
    is4xxClientError: boolean;
    error: boolean;
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

// Axios 인스턴스 생성
const profileImageApi = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
});

// 요청 인터셉터: 인증 토큰 추가
profileImageApi.interceptors.request.use(
  async (config) => {
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
  (error) => {
    return Promise.reject(error);
  },
);

// 프로필 이미지 업데이트 API
export const updateProfileImage = async (
  request: UpdateProfileImageRequest,
): Promise<ApiResponse<any>> => {
  try {
    const response = await profileImageApi.put('/api/users/profile-image', request);
    return response.data;
  } catch (error) {
    console.error('프로필 이미지 업데이트 실패:', error);
    throw error;
  }
};