import {useMutation, useQueryClient} from '@tanstack/react-query';
import {updateDescription} from '../api/profileApi';

export const useUpdateDescription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (description: string) => updateDescription(description),
    onSuccess: () => {
      // 성공 시 관련 쿼리들을 무효화하여 새로운 데이터를 가져오도록 함
      queryClient.invalidateQueries({queryKey: ['profileMe']});
      queryClient.invalidateQueries({queryKey: ['myPage']});
    },
  });
};
