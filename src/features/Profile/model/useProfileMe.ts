import {useQuery} from '@tanstack/react-query';
import {getProfileMe} from '../api/profileApi';

export interface ProfileMeInfo {
  userId: number;
  profileImageUrl: string;
  description: string;
  realName: string;
  nickName: string;
  birthDate: string;
  gender: number;
  systemLanguage: number;
  school: number;
  major: number;
  email: string;
}

/**
 * 본인 프로필 정보 조회 훅
 */
export const useProfileMe = () => {
  return useQuery({
    queryKey: ['profileMe'],
    queryFn: getProfileMe,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2,
  });
};
