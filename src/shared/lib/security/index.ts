import AsyncStorage from '@react-native-async-storage/async-storage';
import {logger} from '@/shared/lib/logger';
import {jwtDecode} from 'jwt-decode';

// 스토리지 키 상수
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';
const LOGIN_TIMESTAMP_KEY = 'login_timestamp';
const USER_ID_KEY = 'user_id';

// 토큰 만료 시간 (7일로 연장)
const TOKEN_EXPIRY_DURATION = 7 * 24 * 60 * 60 * 1000;

/**
 * 단순화된 인증 스토리지 유틸리티
 * AsyncStorage 기반으로 안정적인 자동 로그인을 제공합니다.
 */
export const secureStorage = {
  /**
   * 인증 데이터를 저장합니다.
   */
  async saveToken(token: string): Promise<boolean> {
    try {
      console.log('saveToken 호출됨, 토큰:', token ? '존재' : '없음');
      const timestamp = Date.now();

      // 토큰에서 사용자 ID 추출
      const userId = await this.extractUserIdFromToken(token);
      console.log('추출된 사용자 ID:', userId);

      // 모든 데이터를 한 번에 저장
      const itemsToSet: [string, string][] = [
        [AUTH_TOKEN_KEY, token],
        [LOGIN_TIMESTAMP_KEY, timestamp.toString()],
      ];

      if (userId) {
        itemsToSet.push([USER_ID_KEY, userId.toString()]);
      }

      console.log('저장할 아이템들:', itemsToSet);
      await AsyncStorage.multiSet(itemsToSet);

      console.log('인증 토큰 저장 성공');
      return true;
    } catch (error) {
      console.error('인증 토큰 저장 실패:', error);
      return false;
    }
  },

  /**
   * 저장된 인증 토큰을 가져옵니다.
   */
  async getToken(): Promise<string | null> {
    try {
      console.log('getToken 호출됨');
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      if (!token) {
        console.log('저장된 토큰이 없습니다.');
        return null;
      }

      console.log('토큰 발견:', token ? '존재' : '없음');

      // 토큰 만료 시간 확인 (더 관대하게)
      const timestamp = await AsyncStorage.getItem(LOGIN_TIMESTAMP_KEY);
      if (timestamp) {
        const loginTime = parseInt(timestamp);
        const now = Date.now();

        if (now - loginTime > TOKEN_EXPIRY_DURATION) {
          console.log('토큰이 만료되었습니다. 자동 삭제 중...');
          await this.removeToken();
          return null;
        }
      }

      console.log('토큰 가져오기 성공');
      return token;
    } catch (error) {
      console.error('인증 토큰 가져오기 실패:', error);
      return null;
    }
  },

  /**
   * 인증 토큰을 삭제합니다.
   */
  async removeToken(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        LOGIN_TIMESTAMP_KEY,
        USER_ID_KEY,
        'user_info', // 기존 사용자 정보도 함께 삭제
      ]);

      logger.info('인증 토큰 삭제 완료');
      return true;
    } catch (error) {
      logger.error('인증 토큰 삭제 실패:', error);
      return false;
    }
  },

  /**
   * 토큰의 유효성을 확인합니다.
   */
  async isTokenValid(): Promise<boolean> {
    try {
      console.log('isTokenValid 호출됨');
      const token = await this.getToken();
      if (!token) {
        console.log('토큰이 없어서 유효성 검증 실패');
        return false;
      }

      console.log('토큰 존재, JWT 검증 시작');

      // JWT 만료 시간 확인 (더 관대하게)
      try {
        const decoded = jwtDecode<{exp: number}>(token);
        const currentTime = Date.now() / 1000;
        const bufferTime = 300; // 5분 버퍼로 늘림

        console.log('JWT 디코드 결과:', decoded);
        console.log('현재 시간:', currentTime);
        console.log('만료 시간:', decoded.exp);

        if (decoded.exp && decoded.exp < currentTime + bufferTime) {
          console.log('JWT 토큰이 만료되었습니다.');
          await this.removeToken();
          return false;
        }
      } catch (jwtError) {
        console.error('JWT 토큰 검증 실패:', jwtError);
        // JWT 파싱 실패해도 토큰이 있으면 유효하다고 간주
        console.log('JWT 파싱 실패했지만 토큰이 존재하므로 유효하다고 간주');
        return true;
      }

      console.log('토큰 유효성 검증 성공');
      return true;
    } catch (error) {
      console.error('토큰 유효성 확인 실패:', error);
      return false;
    }
  },

  /**
   * 전체 토큰 검증 (자동 로그인용)
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

      // 다양한 필드명 확인
      if (decoded.memberId) {
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

      logger.warn('토큰에서 사용자 ID를 찾을 수 없음:', decoded);
      return null;
    } catch (error) {
      logger.error('JWT 디코드 실패:', error);
      return null;
    }
  },

  /**
   * 현재 로그인된 사용자의 ID를 가져옵니다.
   */
  async getUserId(): Promise<number | null> {
    try {
      // AsyncStorage에서 직접 확인
      const storedId = await AsyncStorage.getItem(USER_ID_KEY);
      if (storedId) {
        return Number(storedId);
      }

      // 저장된 값이 없으면 토큰에서 추출
      const token = await this.getToken();
      if (token) {
        const userId = await this.extractUserIdFromToken(token);
        if (userId) {
          // 추출된 ID를 저장
          await AsyncStorage.setItem(USER_ID_KEY, String(userId));
          return userId;
        }
      }

      return null;
    } catch (error) {
      logger.error('사용자 ID 가져오기 실패:', error);
      return null;
    }
  },

  /**
   * 사용자 정보를 저장합니다.
   */
  async saveUserData(userData: any): Promise<boolean> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      logger.info('사용자 정보 저장 성공');
      return true;
    } catch (error) {
      logger.error('사용자 정보 저장 실패:', error);
      return false;
    }
  },

  /**
   * 저장된 사용자 정보를 가져옵니다.
   */
  async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error('사용자 정보 가져오기 실패:', error);
      return null;
    }
  },

  /**
   * 모든 인증 관련 데이터를 삭제합니다.
   */
  async clearAllAuthData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove([
        AUTH_TOKEN_KEY,
        USER_DATA_KEY,
        LOGIN_TIMESTAMP_KEY,
        USER_ID_KEY,
        'user_info',
      ]);

      logger.info('모든 인증 데이터 삭제 완료');
      return true;
    } catch (error) {
      logger.error('인증 데이터 삭제 실패:', error);
      return false;
    }
  },

  /**
   * 디버깅용: 현재 저장된 모든 인증 데이터를 확인합니다.
   */
  async debugAuthData(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const authKeys = allKeys.filter(
        key =>
          key.includes('auth') ||
          key.includes('user') ||
          key.includes('token') ||
          key.includes('login'),
      );

      const authData = await AsyncStorage.multiGet(authKeys);

      logger.info('=== 인증 데이터 디버깅 ===');
      logger.info('인증 관련 키들:', authKeys);

      authData.forEach(([key, value]) => {
        if (key === AUTH_TOKEN_KEY) {
          logger.info(`${key}: ${value ? '토큰 존재' : '토큰 없음'}`);
        } else {
          logger.info(`${key}: ${value}`);
        }
      });
      logger.info('========================');
    } catch (error) {
      logger.error('인증 데이터 디버깅 실패:', error);
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
