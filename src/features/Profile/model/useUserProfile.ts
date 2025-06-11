import {useQuery} from '@tanstack/react-query';
import {getUserProfile, UserProfileResponse} from '../api/profileApi';

export interface UserProfileInfo {
  userId: number;
  profileImageUrl: string;
  nickName: string;
  description: string;
  gender: number;
  birthDate: string;
  school: number;
  mainLanguage: number;
  mainLanguageLevel: number;
  learningLanguage: number;
  learningLanguageLevel: number;
  major: number;
}

/**
 * 타인 프로필 정보 조회 훅
 */
export function useUserProfile(userId: number) {
  const {data, isLoading, isError, error, refetch} = useQuery<UserProfileResponse['result']>({
    queryKey: ['userProfile', userId],
    queryFn: () => getUserProfile(userId),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (이전의 cacheTime)
    enabled: !!userId, // userId가 있을 때만 실행
  });

  return {
    userProfile: data,
    isLoading,
    isError,
    error,
    refetch,
  };
}