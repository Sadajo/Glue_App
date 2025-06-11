// src/features/Profile/model/useProfile.ts

import { useApiQuery, useApiMutation } from '@/shared/lib/api/hooks';
import { useQuery } from '@tanstack/react-query';
import { mockProfileApi as api } from './api';
import { getUserLikes, getMeetingsHistory, getMyMeetings } from '../api/profileApi';
import {
  UserProfile,
  GroupHistoryItem,
  LikedGroupItem,
} from './types';

/**
 * 프로필 정보 조회/수정 훅
 */
export function useProfile() {
  // 조회
  const profileQuery = useApiQuery<UserProfile>(
    ['profile'],
    () => api.fetchProfile()
  );

  // 수정
  const updateProfileMutation = useApiMutation<UserProfile, Partial<UserProfile>>(
    'profile',
    (data) => api.updateProfile(data),
    {
      onSuccess: () => {
        // 수정 성공 시 프로필 다시 불러오기
        profileQuery.refetch();
      },
    }
  );

  return {
    profile: profileQuery.data?.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isLoading,
    updateError: updateProfileMutation.error,
  };
}

/**
 * 모임 히스토리 조회 훅
 */
export function useGroupHistory() {
  const historyQuery = useApiQuery<GroupHistoryItem[]>(
    ['profile', 'history'],
    () => api.fetchGroupHistory()
  );

  return {
    history: historyQuery.data?.data || [],
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    refetchHistory: historyQuery.refetch,
  };
}

/**
 * 좋아요한 모임 조회 훅
 */
export function useLikedGroups() {
  const likedQuery = useApiQuery<LikedGroupItem[]>(
    ['profile', 'liked'],
    () => api.fetchLikedGroups()
  );

  return {
    liked: likedQuery.data?.data || [],
    isLoading: likedQuery.isLoading,
    isError: likedQuery.isError,
    refetchLiked: likedQuery.refetch,
  };
}

/**
 * 사용자 좋아요 목록 조회 훅 (실제 API 사용)
 */
export function useUserLikes(targetUserId: number) {
  const likesQuery = useQuery({
    queryKey: ['profile', 'likes', targetUserId.toString()],
    queryFn: () => getUserLikes(targetUserId),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    posts: likesQuery.data?.posts || [],
    isLoading: likesQuery.isLoading,
    isError: likesQuery.isError,
    error: likesQuery.error,
    refetch: likesQuery.refetch,
  };
}

/**
 * 사용자 모임 히스토리 조회 훅 (실제 API 사용)
 */
export function useMeetingsHistory(targetUserId: number) {
  const historyQuery = useQuery({
    queryKey: ['profile', 'meetings-history', targetUserId.toString()],
    queryFn: () => getMeetingsHistory(targetUserId),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    hostedMeetings: historyQuery.data?.hostedMeetings || [],
    joinedMeetings: historyQuery.data?.joinedMeetings || [],
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    error: historyQuery.error,
    refetch: historyQuery.refetch,
  };
}

/**
 * 내가 참여 중인 모임 조회 훅 (실제 API 사용)
 */
export function useMyMeetings() {
  const myMeetingsQuery = useQuery({
    queryKey: ['profile', 'my-meetings'],
    queryFn: () => getMyMeetings(),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    hostedMeetings: myMeetingsQuery.data?.hostedMeetings || [],
    joinedMeetings: myMeetingsQuery.data?.joinedMeetings || [],
    totalMeetings: (myMeetingsQuery.data?.hostedMeetings?.length || 0) + (myMeetingsQuery.data?.joinedMeetings?.length || 0),
    isLoading: myMeetingsQuery.isLoading,
    isError: myMeetingsQuery.isError,
    error: myMeetingsQuery.error,
    refetch: myMeetingsQuery.refetch,
  };
}