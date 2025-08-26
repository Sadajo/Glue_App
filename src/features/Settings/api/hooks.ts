import {useQuery} from '@tanstack/react-query';
import {getNotices, getNotice, GetNoticesParams, NoticeDto} from './noticeApi';

// 공지사항 목록 조회 훅
export const useNotices = (params: GetNoticesParams = {}) => {
  return useQuery({
    queryKey: ['notices', JSON.stringify(params)],
    queryFn: () => getNotices(params),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

// 공지사항 상세 조회 훅
export const useNotice = (noticeId: number) => {
  return useQuery({
    queryKey: ['notice', noticeId],
    queryFn: () => getNotice(noticeId),
    enabled: !!noticeId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};
