import {
  sendVerificationCode,
  verifyCode,
  signinWithApple,
  signupWithApple,
  signupWithKakao,
  signinWithKakao,
  checkNicknameDuplicate,
  signout,
} from './api';
import {useApiMutation} from '@/shared/lib/api/hooks';

// 이메일 인증 코드 전송 훅 (원래 이름 유지)
export const useSendVerificationCode = () => {
  return useApiMutation('sendVerificationCode', sendVerificationCode);
};

// 이메일 인증 코드 검증 훅 (원래 이름 유지)
export const useVerifyCode = () => {
  return useApiMutation(
    'verifyCode',
    (variables: {email: string; code: string}) =>
      verifyCode(variables.email, variables.code),
  );
};

// 카카오 회원가입 훅 (원래 이름 유지)
export const useKakaoSignup = () => {
  return useApiMutation('kakaoSignup', signupWithKakao);
};

// 카카오 로그인 훅 (원래 이름 유지)
export const useKakaoSignin = () => {
  return useApiMutation(
    'kakaoSignin',
    (variables: {kakaoToken: string; fcmToken?: string}) =>
      signinWithKakao(variables.kakaoToken, variables.fcmToken),
  );
};

// 애플 회원가입 훅 (원래 이름 유지)
export const useAppleSignup = () => {
  return useApiMutation('appleSignup', signupWithApple);
};

// 애플 로그인 훅 (원래 이름 유지)
export const useAppleSignin = () => {
  return useApiMutation(
    'appleSignin',
    (variables: {idToken: string; fcmToken: string}) =>
      signinWithApple(variables.idToken, variables.fcmToken),
  );
};

// 닉네임 중복 확인 훅
export const useCheckNicknameDuplicate = () => {
  return useApiMutation('checkNicknameDuplicate', checkNicknameDuplicate);
};

// 회원 탈퇴 훅
export const useSignout = () => {
  return useApiMutation('signout', signout);
};
