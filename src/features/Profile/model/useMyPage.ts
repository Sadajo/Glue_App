import {useQuery} from '@tanstack/react-query';
import {getMyPageInfo} from '../api/profileApi';

export interface MyPageInfo {
  profileImageUrl: string;
  userNickname: string;
  description: string;
  mainLanguage: number;
  mainLanguageLevel: number;
  learningLanguage: number;
  learningLanguageLevel: number;
}

/**
 * 마이페이지 정보 조회 훅
 */
export function useMyPage() {
  const {data, isLoading, isError, error, refetch} = useQuery<MyPageInfo>({
    queryKey: ['myPage'],
    queryFn: getMyPageInfo,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (이전의 cacheTime)
  });

  return {
    myPageInfo: data,
    isLoading,
    isError,
    error,
    refetch,
  };
}
