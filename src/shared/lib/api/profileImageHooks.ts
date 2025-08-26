import {useMutation, useQueryClient} from '@tanstack/react-query';
import {updateProfileImage} from './profileImageApi';
import type {UpdateProfileImageRequest, ApiResponse} from './profileImageApi';
import {useImageUpload} from './uploadHooks';

// 프로필 이미지 업데이트 훅
export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiResponse<any>, Error, UpdateProfileImageRequest>({
    mutationFn: updateProfileImage,
    onSuccess: () => {
      // 프로필 관련 캐시 무효화
      queryClient.invalidateQueries({queryKey: ['myPage']});
      queryClient.invalidateQueries({queryKey: ['profileMe']});
    },
  });
};

// 전체 프로필 이미지 업로드 + 업데이트 프로세스 훅
export const useProfileImageUploadAndUpdate = () => {
  const queryClient = useQueryClient();
  const imageUpload = useImageUpload();
  const updateImage = useUpdateProfileImage();

  return useMutation<
    string,
    Error,
    {
      imageUri: string;
      fileName?: string;
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    }
  >({
    mutationFn: async ({imageUri, fileName, maxWidth, maxHeight, quality}) => {
      try {
        // URL 안전한 파일명 생성 (한글, 특수문자 제거)
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const safeFileName = `profile_${timestamp}_${randomId}.jpg`;

        console.log('🔧 URL 안전 파일명 생성:', {
          original: fileName,
          safe: safeFileName,
        });

        // 1. S3에 이미지 업로드
        const publicUrl = await imageUpload.mutateAsync({
          bucketObject: 'profile_images',
          imageUri: imageUri,
          fileName: safeFileName, // 안전한 파일명 사용
          maxWidth,
          maxHeight,
          quality,
        });

        // 2. 프로필 이미지 URL 업데이트
        await updateImage.mutateAsync({
          profileImageUrl: publicUrl,
        });

        // 3. 업로드된 이미지 URL 반환
        return publicUrl;
      } catch (error) {
        console.error('프로필 이미지 업로드 및 업데이트 실패:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // 업로드 성공 시 프로필 관련 캐시 무효화
      queryClient.invalidateQueries({queryKey: ['myPage']});
      queryClient.invalidateQueries({queryKey: ['profileMe']});
    },
  });
};
