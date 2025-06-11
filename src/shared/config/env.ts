import Config from 'react-native-config';

type Environment = 'development' | 'testing' | 'production';

interface EnvConfig {
  API_URL: string;
  API_TIMEOUT: number;
  AUTH_STORAGE_KEY: string;
  ENABLE_LOGGING: boolean;
}

// react-native-config에서 환경 변수 가져오기
const envConfig: EnvConfig = {
  // API_URL: Config.API_URL || 'http://10.0.2.2:8080',
  API_URL: Config.API_URL || 'http://13.125.235.131:8080',
  API_TIMEOUT: Number(Config.API_TIMEOUT) || 15000,
  AUTH_STORAGE_KEY: Config.AUTH_STORAGE_KEY || 'auth_token',
  ENABLE_LOGGING: Config.ENABLE_LOGGING === 'true',
};

// 현재 환경 감지
const getEnvironment = (): Environment => {
  if (__DEV__) {
    return 'development';
  }

  // 배포 중인 경우, .env.production 값이 적용됨
  return 'production';
};

// 현재 환경 정보 노출
export const currentEnv = getEnvironment();

// 환경 설정 값 export
export const config = envConfig;

// 디버깅용 환경 정보 출력
if (__DEV__ && envConfig.ENABLE_LOGGING) {
  console.log('[ENV]', {
    environment: currentEnv,
    config: envConfig,
  });
}
