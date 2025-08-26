import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  getMyPageInfo,
  getProfileMe,
  getUserProfile,
  getMyLikes,
  getMeetingsHistory,
  getMyMeetings,
  updateMainLanguage,
  updateLearningLanguage,
  UpdateLanguageRequest,
} from './profileApi';

// 언어 설정 API 훅들
export const useUpdateMainLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateLanguageRequest) => updateMainLanguage(request),
    onSuccess: () => {
      // 마이페이지 정보 캐시 무효화
      queryClient.invalidateQueries({queryKey: ['myPageInfo']});
      queryClient.invalidateQueries({queryKey: ['profileMe']});
    },
  });
};

export const useUpdateLearningLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateLanguageRequest) =>
      updateLearningLanguage(request),
    onSuccess: () => {
      // 마이페이지 정보 캐시 무효화
      queryClient.invalidateQueries({queryKey: ['myPageInfo']});
      queryClient.invalidateQueries({queryKey: ['profileMe']});
    },
  });
};
