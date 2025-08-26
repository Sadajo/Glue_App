import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {AxiosError} from 'axios';

// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// API 에러 타입
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

// 커스텀 쿼리 훅 - 데이터 조회
export function useApiQuery<T>(
  queryKey: string | string[],
  fetcher: () => Promise<ApiResponse<T>>,
  options?: Omit<
    UseQueryOptions<ApiResponse<T>, AxiosError<ApiError>>,
    'queryKey' | 'queryFn'
  >,
) {
  const queryKeyArray = Array.isArray(queryKey) ? queryKey : [queryKey];

  return useQuery<ApiResponse<T>, AxiosError<ApiError>>({
    queryKey: queryKeyArray,
    queryFn: fetcher,
    ...options,
  });
}

// 커스텀 무한 쿼리 훅 - 무한 스크롤을 위한 데이터 조회
export function useApiInfiniteQuery<T>(
  queryKey: readonly unknown[],
  fetcher: (params: {pageParam?: unknown}) => Promise<ApiResponse<T>>,
  options?: any,
) {
  return useInfiniteQuery({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
}

// 커스텀 뮤테이션 훅 - 데이터 변경(생성/수정/삭제)
export function useApiMutation<T, V>(
  mutationKey: string,
  mutationFn: (variables: V) => Promise<ApiResponse<T>>,
  options?: Omit<
    UseMutationOptions<ApiResponse<T>, AxiosError<ApiError>, V>,
    'mutationFn'
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<T>, AxiosError<ApiError>, V>({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      // 성공 시 기본적으로 쿼리 무효화
      queryClient.invalidateQueries({queryKey: [mutationKey]});

      // 추가 성공 콜백 실행
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  });
}

// 무한 스크롤을 위한 API 응답 타입
export interface PaginatedApiResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
  };
  success: boolean;
  message?: string;
}
