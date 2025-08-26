import {useQuery} from '@tanstack/react-query';
import {getMyGuestBooks} from '../api/guestbookApi';
import {GuestBookItem} from './guestbookTypes';
import {secureStorage} from '@shared/lib/security';
import {useEffect, useState} from 'react';

/**
 * 내 방명록 조회 훅
 */
export function useMyGuestbook(pageSize: number = 10) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const userId = await secureStorage.getUserId();
        setCurrentUserId(userId);
      } catch (error) {
        console.error('사용자 ID 가져오기 실패:', error);
      }
    };
    getCurrentUserId();
  }, []);

  const {
    data: guestbooks,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<GuestBookItem[]>({
    queryKey: ['myGuestbook', currentUserId],
    queryFn: () => {
      if (!currentUserId) {
        throw new Error('사용자 ID를 찾을 수 없습니다.');
      }
      return getMyGuestBooks(currentUserId, undefined, pageSize);
    },
    enabled: !!currentUserId, // currentUserId가 있을 때만 쿼리 실행
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });

  return {
    guestbooks: guestbooks || [],
    isLoading,
    isError,
    error,
    refetch,
    currentUserId,
  };
}
