import {useApiQuery} from '@/shared/lib/api/hooks';
import {
  getNotifications,
  GetNotificationsParams,
  NotificationDto,
} from './noticeApi';

// 일반 알림 목록 조회 훅 (소식 탭)
export const useNewsNotifications = (
  params: Omit<GetNotificationsParams, 'isNoticeTab'> = {},
) => {
  return useApiQuery<NotificationDto[]>(
    ['notifications', 'news', JSON.stringify(params)],
    () => getNotifications({...params, isNoticeTab: false}),
    {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
    },
  );
};

// 공지 알림 목록 조회 훅 (공지 탭)
export const useNoticeNotifications = (
  params: Omit<GetNotificationsParams, 'isNoticeTab'> = {},
) => {
  return useApiQuery<NotificationDto[]>(
    ['notifications', 'notice', JSON.stringify(params)],
    () => getNotifications({...params, isNoticeTab: true}),
    {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
    },
  );
};

// 알림 목록 조회 훅 (범용)
export const useNotifications = (params: GetNotificationsParams = {}) => {
  return useApiQuery<NotificationDto[]>(
    ['notifications', JSON.stringify(params)],
    () => getNotifications(params),
    {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분
    },
  );
};
