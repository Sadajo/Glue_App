import {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useQueryClient} from '@tanstack/react-query';
import {logger} from '@/shared/lib/logger';
import {secureStorage} from '@/shared/lib/security';
import {ApiResponse} from '@/shared/lib/api/hooks';

// 인증 상태 타입
export type AuthStatus = 'initial' | 'authenticated' | 'unauthenticated';

// 사용자 타입
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  createdAt: string;
}

// 인증 응답 타입
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * 인증 프로세스를 관리하는 훅
 * 앱 전반에 걸쳐 인증 상태를 제공합니다.
 */
export const useAuth = () => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initial');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  // 초기 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 개선된 토큰 검증 사용 (서버 검증 포함)
        const isValid = await secureStorage.validateTokenCompletely();

        if (isValid) {
          // 사용자 정보 불러오기 로직
          const userJson = await AsyncStorage.getItem('user_info');

          if (userJson) {
            const userData = JSON.parse(userJson) as User;
            setUser(userData);
            setAuthStatus('authenticated');
            logger.info('사용자 인증 상태: 로그인됨', {userId: userData.id});
          } else {
            // 토큰은 유효하지만 사용자 정보가 없는 경우
            logger.warn('유효한 토큰이 있지만 사용자 정보가 없습니다.');
            setAuthStatus('unauthenticated');
            await clearAuth();
          }
        } else {
          // 토큰이 유효하지 않은 경우
          setAuthStatus('unauthenticated');
          await clearAuth();
        }
      } catch (error) {
        logger.error('인증 상태 확인 중 오류 발생', error);
        setAuthStatus('unauthenticated');
        await clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 로그인 함수
  const login = useCallback(
    async (
      email: string,
      _password: string,
    ): Promise<ApiResponse<AuthResponse>> => {
      try {
        setIsLoading(true);

        // 실제 로그인 API 호출
        // 예시: const response = await authApi.login(email, password);

        // 모의 응답 (실제로는 API 응답으로 교체)
        const response: ApiResponse<AuthResponse> = {
          success: true,
          data: {
            user: {
              id: '1',
              email: email,
              name: 'Test User',
              profileImage: '',
              createdAt: new Date().toISOString(),
            },
            token: 'mock-jwt-token',
          },
          message: '로그인 성공',
        };

        if (response.success) {
          // 토큰 저장
          await secureStorage.saveToken(response.data.token);

          // 사용자 정보 저장
          await AsyncStorage.setItem(
            'user_info',
            JSON.stringify(response.data.user),
          );

          // 상태 업데이트
          setUser(response.data.user);
          setAuthStatus('authenticated');

          logger.info('사용자 로그인 성공', {userId: response.data.user.id});
        }

        return response;
      } catch (error) {
        logger.error('로그인 중 오류 발생', error);
        return {
          success: false,
          data: {} as AuthResponse,
          message: '로그인 실패',
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 로그아웃 처리
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // 로그아웃 처리
      await clearAuth();

      // 인증 상태 업데이트
      setAuthStatus('unauthenticated');
      setUser(null);

      // 캐시된 쿼리 데이터 초기화 (선택적)
      queryClient.clear();

      logger.info('로그아웃 성공');
      return true;
    } catch (error) {
      logger.error('로그아웃 실패', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [queryClient]);

  // 회원가입 처리
  const register = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      try {
        setIsLoading(true);

        // 회원가입 API 호출 (실제 앱에서는 API 클라이언트 사용)
        // 예제로만 구현 (실제로는 API 요청 필요)
        const response: ApiResponse<AuthResponse> = {
          data: {
            user: {
              id: '1',
              email,
              name,
              createdAt: new Date().toISOString(),
            },
            token: 'mock_token_' + Date.now(),
          },
          success: true,
          message: '회원가입 성공',
        };

        // 토큰 저장
        const saveResult = await secureStorage.saveToken(response.data.token);

        if (saveResult) {
          // 사용자 정보 저장
          await AsyncStorage.setItem(
            'user_info',
            JSON.stringify(response.data.user),
          );

          // 상태 업데이트
          setUser(response.data.user);
          setAuthStatus('authenticated');

          logger.info('회원가입 성공', {email});
          return true;
        } else {
          throw new Error('토큰 저장 실패');
        }
      } catch (error) {
        logger.error('회원가입 실패', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 인증 정보 초기화 (내부용)
  const clearAuth = async () => {
    await secureStorage.removeToken();
    await AsyncStorage.removeItem('user_info');
  };

  return {
    authStatus,
    user,
    isLoading,
    login,
    logout,
    register,
    isAuthenticated: authStatus === 'authenticated',
  };
};
