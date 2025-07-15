import * as Keychain from 'react-native-keychain';
import {config} from '@/shared/config/env';
import {logger} from '@/shared/lib/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';

// 사용자 ID를 AsyncStorage에 저장하기 위한 키
const USER_ID_STORAGE_KEY = 'user_id';

// 토큰 캐시 및 동시 접근 제어를 위한 변수들
let tokenCache: string | null = null;
let tokenCacheTimestamp: number = 0;
let isTokenLoading = false;
let tokenValidationPromise: Promise<boolean> | null = null;

// 토큰 캐시 유효 시간 (30초)
const TOKEN_CACHE_DURATION = 30 * 1000;

/**
 * 보안 스토리지 유틸리티
 * 민감한 데이터(토큰 등)를 안전하게 저장합니다.
 */
export const secureStorage = {
  /**
   * 인증 토큰을 안전하게 저장합니다.
   */
  async saveToken(token: string): Promise<boolean> {
    try {
      const result = await Keychain.setGenericPassword(
        config.AUTH_STORAGE_KEY,
        token,
      );

      // 캐시 업데이트
      if (result) {
        tokenCache = token;
        tokenCacheTimestamp = Date.now();
      }

      // 토큰 저장 후 사용자 ID를 추출하여 AsyncStorage에 저장
      try {
        const userId = await this.extractUserIdFromToken(token);
        if (userId) {
          await AsyncStorage.setItem(USER_ID_STORAGE_KEY, String(userId));
          logger.info('사용자 ID 저장 성공', {userId});
        }
      } catch (idError) {
        logger.error('토큰에서 사용자 ID 추출 실패', idError);
      }

      return !!result;
    } catch (error) {
      logger.error('Failed to save auth token', error);
      return false;
    }
  },

  /**
   * 저장된 인증 토큰을 가져옵니다.
   * 캐시를 사용하여 성능을 향상시킵니다.
   */
  async getToken(): Promise<string | null> {
    // 캐시된 토큰이 유효한지 확인
    if (tokenCache && Date.now() - tokenCacheTimestamp < TOKEN_CACHE_DURATION) {
      return tokenCache;
    }

    // 이미 토큰을 로딩 중인 경우 대기
    if (isTokenLoading) {
      return new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!isTokenLoading) {
            clearInterval(checkInterval);
            resolve(tokenCache);
          }
        }, 10);
      });
    }

    isTokenLoading = true;
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && credentials.password) {
        tokenCache = credentials.password;
        tokenCacheTimestamp = Date.now();
        return credentials.password;
      }

      tokenCache = null;
      return null;
    } catch (error) {
      logger.error('Failed to get auth token', error);
      tokenCache = null;
      return null;
    } finally {
      isTokenLoading = false;
    }
  },

  /**
   * 인증 토큰을 삭제합니다.
   */
  async removeToken(): Promise<boolean> {
    try {
      // 캐시 초기화
      tokenCache = null;
      tokenCacheTimestamp = 0;
      tokenValidationPromise = null;

      await AsyncStorage.removeItem(USER_ID_STORAGE_KEY);
      return await Keychain.resetGenericPassword();
    } catch (error) {
      logger.error('Failed to remove auth token', error);
      return false;
    }
  },

  /**
   * 인증 토큰의 유효성을 확인합니다.
   * 토큰 존재 여부와 만료 시간을 검사합니다.
   */
  async isTokenValid(): Promise<boolean> {
    // 진행 중인 검증이 있다면 대기
    if (tokenValidationPromise) {
      return tokenValidationPromise;
    }

    const validationPromise = this._performTokenValidation();
    tokenValidationPromise = validationPromise;

    return validationPromise;
  },

  /**
   * 실제 토큰 검증을 수행하는 내부 메서드
   */
  async _performTokenValidation(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) {
      logger.info('저장된 토큰이 없습니다.');
      return false;
    }

    try {
      // 클라이언트 측 토큰 만료 검사
      const decoded = jwtDecode<{exp: number}>(token);
      const currentTime = Date.now() / 1000;
      const bufferTime = 30; // 30초 버퍼 추가 (네트워크 지연 고려)
      const isClientValid = decoded.exp > currentTime + bufferTime;

      if (!isClientValid) {
        logger.info('토큰이 만료되었습니다. 자동 삭제 중...');
        await this.removeToken();
        return false;
      }

      return true;
    } catch (error) {
      logger.error('JWT 토큰 검증 실패:', error);
      // 토큰이 잘못된 형식이면 삭제
      await this.removeToken();
      return false;
    } finally {
      // 검증 완료 후 promise 초기화
      tokenValidationPromise = null;
    }
  },

  /**
   * 전체 토큰 검증
   * 자동 로그인 시 사용
   */
  async validateTokenCompletely(): Promise<boolean> {
    return this.isTokenValid();
  },

  /**
   * JWT 토큰에서 사용자 ID를 추출합니다.
   */
  async extractUserIdFromToken(token: string): Promise<number | null> {
    try {
      const decoded = jwtDecode<any>(token);
      logger.info('JWT 디코드 성공', decoded);

      // 다양한 필드명 확인 (각 백엔드에 따라 다를 수 있음)
      if (decoded.memberId) {
        logger.info('memberId 필드에서 사용자 ID 발견', decoded.memberId);
        return Number(decoded.memberId);
      } else if (decoded.sub) {
        return Number(decoded.sub);
      } else if (decoded.id) {
        return Number(decoded.id);
      } else if (decoded.userId) {
        return Number(decoded.userId);
      } else if (decoded.user_id) {
        return Number(decoded.user_id);
      }

      // 전체 디코딩 결과 출력 (디버깅용)
      logger.warn('토큰에서 사용자 ID를 찾을 수 없음. 전체 내용:', decoded);
      return null;
    } catch (error) {
      logger.error('JWT 디코드 실패', error);
      return null;
    }
  },

  /**
   * 현재 로그인된 사용자의 ID를 가져옵니다.
   */
  async getUserId(): Promise<number | null> {
    try {
      // 1. AsyncStorage에서 먼저 확인 (가장 빠름)
      const storedId = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);
      if (storedId) {
        return Number(storedId);
      }

      // 2. 저장된 값이 없으면 토큰에서 추출
      const token = await this.getToken();
      if (token) {
        const userId = await this.extractUserIdFromToken(token);
        if (userId) {
          // 추출된 ID를 AsyncStorage에 저장하여 다음에는 빠르게 접근
          await AsyncStorage.setItem(USER_ID_STORAGE_KEY, String(userId));
          return userId;
        }
      }

      return null;
    } catch (error) {
      logger.error('사용자 ID 가져오기 실패', error);
      return null;
    }
  },
};

/**
 * 민감한 데이터를 마스킹합니다.
 * 예: 전화번호, 이메일 등
 */
export const maskSensitiveData = {
  /**
   * 이메일 주소를 마스킹합니다.
   * 예: jo***@example.com
   */
  email(email: string): string {
    if (!email || email.length < 5) return email;

    const [local, domain] = email.split('@');
    if (!domain) return email;

    let maskedLocal = local;
    if (local.length > 2) {
      maskedLocal = local.substring(0, 2) + '*'.repeat(local.length - 2);
    }

    return `${maskedLocal}@${domain}`;
  },

  /**
   * 전화번호를 마스킹합니다.
   * 예: 010-****-5678
   */
  phoneNumber(phone: string): string {
    if (!phone || phone.length < 4) return phone;

    // 하이픈 제거
    const digits = phone.replace(/-/g, '');

    // 전화번호 길이에 따른 마스킹
    if (digits.length === 11) {
      // 휴대폰 번호: 010-XXXX-5678
      return `${digits.substring(0, 3)}-****-${digits.substring(7)}`;
    } else if (digits.length === 10) {
      // 일반 전화번호: 02-XXX-5678
      const areaCode = digits.substring(0, 2);
      return `${areaCode}-***-${digits.substring(5)}`;
    }

    // 기타 형식의 전화번호
    return (
      digits.substring(0, Math.floor(digits.length / 2)) +
      '*'.repeat(Math.ceil(digits.length / 2))
    );
  },
};
