import {apiClient} from '@/features/auth/api/api';
import {secureStorage} from '@/shared/lib/security';
import axios from 'axios';

// 캐러셀 이미지 타입
export interface CarouselImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
  description: string;
}

// 캐러셀 응답 타입
export interface CarouselResponse {
  version: string;
  images: CarouselImage[];
  totalCount: number;
}

// 인기 게시글 응답 타입
export interface PopularPost {
  postId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  meetingDate: string;
  meetingLocation: string;
  authorNickname: string;
  authorProfileImageUrl: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  category: string;
  categoryColor: string;
  categoryBgColor: string;
  maxParticipants: number;
  currentParticipants: number;
}

export interface PopularPostsResponse {
  posts: PopularPost[];
}

/**
 * 메인 캐러셀 이미지를 가져오는 API 함수
 */
export const getMainCarousel = async (version?: string) => {
  const endpoint = '/api/main/carousel';
  const params = version ? {version} : {};

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    const response = await apiClient.get(endpoint, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('캐러셀 데이터 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('캐러셀 데이터 조회 실패:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      console.error(`HTTP ${status}: ${message}`);

      if (status === 401) {
        throw new Error(
          `인증 실패 (${status}): 토큰이 만료되었거나 유효하지 않습니다`,
        );
      } else if (status === 403) {
        throw new Error(`접근 권한 없음 (${status}): ${message}`);
      } else if (status === 404) {
        throw new Error(`리소스를 찾을 수 없음 (${status}): ${message}`);
      } else if (status === 500) {
        throw new Error(`서버 오류 (${status}): ${message}`);
      } else if (status) {
        throw new Error(`API 오류 (${status}): ${message}`);
      } else {
        throw new Error(`네트워크 오류: ${message}`);
      }
    }

    throw error;
  }
};

/**
 * 인기 게시글을 가져오는 API 함수
 * @param size 가져올 게시글 개수 (기본값: 2)
 */
export const getPopularPosts = async (size: number = 2) => {
  const endpoint = '/api/posts/popular';

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    const response = await apiClient.get(endpoint, {
      params: {size},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('인기 게시글 응답:', response.data);

    return {
      data: response.data.result,
      success: response.data.isSuccess,
      message: response.data.message || '',
    };
  } catch (error) {
    console.error('인기 게시글 조회 실패:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      console.error(`HTTP ${status}: ${message}`);

      if (status === 401) {
        throw new Error(
          `인증 실패 (${status}): 토큰이 만료되었거나 유효하지 않습니다`,
        );
      } else if (status === 403) {
        throw new Error(`접근 권한 없음 (${status}): ${message}`);
      } else if (status === 404) {
        throw new Error(`리소스를 찾을 수 없음 (${status}): ${message}`);
      } else if (status === 500) {
        throw new Error(`서버 오류 (${status}): ${message}`);
      } else if (status) {
        throw new Error(`API 오류 (${status}): ${message}`);
      } else {
        throw new Error(`네트워크 오류: ${message}`);
      }
    }

    throw error;
  }
};

/**
 * 언어 교환 모임 게시글을 가져오는 API 함수
 * @param size 가져올 게시글 개수 (기본값: 2)
 */
export const getLanguageMatchPosts = async (size: number = 2) => {
  const endpoint = '/api/posts/language-match';

  try {
    // JWT 토큰 가져오기
    const token = await secureStorage.getToken();
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }

    const response = await apiClient.get(endpoint, {
      params: {size},
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('언어 교환 모임 응답:', response.data);

    return {
      data: response.data.result,
      success: response.data.isSuccess,
      message: response.data.message || '',
    };
  } catch (error) {
    console.error('언어 교환 모임 조회 실패:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      console.error(`HTTP ${status}: ${message}`);

      if (status === 401) {
        throw new Error(
          `인증 실패 (${status}): 토큰이 만료되었거나 유효하지 않습니다`,
        );
      } else if (status === 403) {
        throw new Error(`접근 권한 없음 (${status}): ${message}`);
      } else if (status === 404) {
        throw new Error(`리소스를 찾을 수 없음 (${status}): ${message}`);
      } else if (status === 500) {
        throw new Error(`서버 오류 (${status}): ${message}`);
      } else if (status) {
        throw new Error(`API 오류 (${status}): ${message}`);
      } else {
        throw new Error(`네트워크 오류: ${message}`);
      }
    }

    throw error;
  }
};
