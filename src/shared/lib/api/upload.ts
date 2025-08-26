import axios from 'axios';
import {config} from '@shared/config/env';

// Presigned URL 요청 타입
export interface PresignedUrlRequest {
  bucketObject: string; // S3 버킷의 폴더명 (예: post_images, profile_images)
  extension: string; // 파일 확장자 (예: jpg, png)
  contentType?: string; // MIME 타입 (예: image/jpeg, image/png)
}

// Presigned URL 응답 타입
export interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
}

// Axios 인스턴스 생성
const uploadApi = axios.create({
  baseURL: config.API_URL,
  timeout: config.API_TIMEOUT,
});

// 요청 인터셉터: 인증 토큰 추가
uploadApi.interceptors.request.use(
  async requestConfig => {
    try {
      const {secureStorage} = await import('@shared/lib/security');
      const token = await secureStorage.getToken();
      console.log('presigned URL 요청시 토큰:', token);
      if (token) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
        console.log('Authorization 헤더 설정됨:', requestConfig.headers.Authorization);
      } else {
        console.error('토큰이 없습니다!');
      }
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
    }
    return requestConfig;
  },
  error => {
    return Promise.reject(error);
  },
);

// Presigned URL 요청 API
export const getPresignedUrl = async (
  params: PresignedUrlRequest,
): Promise<PresignedUrlResponse> => {
  try {
    console.log('프리사인URL 요청 시작:', params);

    const response = await uploadApi.post('/api/aws/presigned-url', null, {
      params: {
        bucketObject: params.bucketObject,
        extension: params.extension,
        contentType: params.contentType || getContentType(params.extension),
      },
    });

    console.log('프리사인URL 응답 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('Presigned URL 요청 실패:', error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      if (status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
      } else if (status === 403) {
        throw new Error('파일 업로드 권한이 없습니다.');
      } else if (status === 400) {
        throw new Error(`잘못된 요청입니다: ${message}`);
      } else if (status === 500) {
        throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else {
        throw new Error(`업로드 준비 중 오류가 발생했습니다: ${message}`);
      }
    }

    throw error;
  }
};

// S3에 파일 업로드 (XMLHttpRequest 사용)
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File | Blob,
  contentType: string,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      console.log('📡 S3 XMLHttpRequest 업로드 시작:', {
        url: presignedUrl.substring(0, 100) + '...',
        fileSize: file.size,
        contentType: contentType,
        fileType: file.constructor.name,
      });

      const xhr = new XMLHttpRequest();

      // 업로드 진행률 모니터링
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`📊 업로드 진행률: ${percentComplete.toFixed(1)}%`);
        }
      };

      // 성공 콜백
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('✅ S3 XMLHttpRequest 업로드 성공:', {
            status: xhr.status,
            statusText: xhr.statusText,
            responseHeaders: xhr.getAllResponseHeaders(),
          });
          resolve();
        } else {
          console.error('❌ S3 업로드 HTTP 오류:', {
            status: xhr.status,
            statusText: xhr.statusText,
            responseText: xhr.responseText,
          });
          reject(new Error(`S3 업로드 실패: ${xhr.status} ${xhr.statusText}`));
        }
      };

      // 오류 콜백
      xhr.onerror = () => {
        console.error('❌ S3 XMLHttpRequest 네트워크 오류:', {
          status: xhr.status,
          statusText: xhr.statusText,
          readyState: xhr.readyState,
        });
        reject(new Error('네트워크 오류가 발생했습니다'));
      };

      // 타임아웃 콜백
      xhr.ontimeout = () => {
        console.error('❌ S3 XMLHttpRequest 타임아웃');
        reject(new Error('업로드 타임아웃이 발생했습니다'));
      };

      // 중단 콜백
      xhr.onabort = () => {
        console.error('❌ S3 XMLHttpRequest 중단됨');
        reject(new Error('업로드가 중단되었습니다'));
      };

      // PUT 요청 설정
      xhr.open('PUT', presignedUrl, true);
      xhr.timeout = 30000; // 30초 타임아웃

      // Content-Type 헤더 설정 (중요!)
      xhr.setRequestHeader('Content-Type', contentType);

      console.log('🔍 XMLHttpRequest 헤더 설정:', {
        'Content-Type': contentType,
      });

      // 파일 전송
      xhr.send(file);

    } catch (error) {
      console.error('❌ S3 XMLHttpRequest 업로드 실패:', error);
      reject(error);
    }
  });
};

// Axios를 사용한 백업 업로드 방식
export const uploadFileToS3WithAxios = async (
  presignedUrl: string,
  file: File | Blob,
  contentType: string,
): Promise<void> => {
  try {
    console.log('📡 S3 Axios 백업 업로드 시작:', {
      url: presignedUrl.substring(0, 100) + '...',
      fileSize: file.size,
      contentType: contentType,
      fileType: file.constructor.name,
    });

    const response = await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': contentType,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000,
    });

    console.log('✅ S3 Axios 업로드 성공:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('❌ S3 Axios 업로드 실패:', error);

    if (axios.isAxiosError(error)) {
      console.error('📊 에러 상세정보:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }

    throw error;
  }
};

// 파일 업로드 전체 프로세스
export const uploadFile = async (
  bucketObject: string,
  file: File | Blob,
  fileName: string,
): Promise<string> => {
  try {
    console.log('📤 파일 업로드 프로세스 시작:', {
      bucketObject,
      fileName,
      fileSize: file.size,
    });

    // 1단계: 파일 크기 검증
    if (!file || file.size === 0) {
      console.error('❌ 파일이 비어있음:', { fileExists: !!file, fileSize: file?.size });
      throw new Error('파일이 비어있거나 존재하지 않습니다.');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB 제한
      console.error('❌ 파일 크기 초과:', file.size);
      throw new Error('파일 크기가 10MB를 초과합니다.');
    }

    console.log('✅ 파일 크기 검증 통과:', {
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2) + 'MB',
    });

    // 파일 확장자 추출
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    console.log('📋 파일 확장자:', extension);

    // 파일 타입 결정 - Blob의 실제 타입을 우선 사용
    let contentType: string;
    if (file instanceof Blob && file.type) {
      contentType = file.type;
      console.log('🎯 Blob의 실제 타입 사용:', contentType);
    } else {
      contentType = getContentType(extension);
      console.log('📝 확장자 기반 타입 사용:', contentType);
    }

    // Presigned URL 요청
    console.log('🔑 프리사인 URL 요청 중...');
    const {presignedUrl, publicUrl} = await getPresignedUrl({
      bucketObject,
      extension,
      contentType,
    });
    console.log('✅ 프리사인 URL 받음:', {
      publicUrl,
      presignedUrlLength: presignedUrl.length,
      contentType,
    });

    // S3에 파일 업로드 (XMLHttpRequest 우선, 실패 시 Axios 백업)
    console.log('☁️ S3 업로드 시작 (XMLHttpRequest)...');
    try {
      await uploadFileToS3(presignedUrl, file, contentType);
      console.log('🎉 S3 XMLHttpRequest 업로드 완료!');
    } catch (xmlError) {
      console.warn('⚠️ XMLHttpRequest 실패, Axios로 재시도:', xmlError);
      await uploadFileToS3WithAxios(presignedUrl, file, contentType);
      console.log('🎉 S3 Axios 백업 업로드 완료!');
    }

    // 업로드된 파일의 공개 URL 반환
    return publicUrl;
  } catch (error) {
    console.error('💥 파일 업로드 실패:', error);
    throw error;
  }
};

// 업로드된 이미지 URL 검증
export const validateUploadedImage = async (
  imageUrl: string,
): Promise<boolean> => {
  try {
    console.log('🔍 이미지 URL 검증 시작:', imageUrl);

    const response = await fetch(imageUrl, {
      method: 'HEAD', // 헤더만 요청하여 빠르게 확인
    });

    if (!response.ok) {
      console.error(
        '❌ 이미지 URL 접근 실패:',
        response.status,
        response.statusText,
      );
      return false;
    }

    const contentType = response.headers.get('Content-Type');
    const contentLength = response.headers.get('Content-Length');

    console.log('✅ 이미지 URL 검증 성공:', {
      status: response.status,
      contentType,
      contentLength,
      isImage: contentType?.startsWith('image/'),
    });

    // Content-Type이 이미지인지 확인
    return contentType?.startsWith('image/') || false;
  } catch (error) {
    console.error('💥 이미지 URL 검증 실패:', error);
    return false;
  }
};

// 파일 확장자에 따른 Content-Type 결정
const getContentType = (extension: string): string => {
  switch (extension.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
};
