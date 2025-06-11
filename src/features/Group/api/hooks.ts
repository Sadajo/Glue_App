import {
  useApiMutation,
  useApiInfiniteQuery,
  useApiQuery,
} from '@/shared/lib/api/hooks';
import {
  CreateGroupPostRequest,
  CreateGroupPostResponse,
  GetPostResponse,
  GetPostsResponse,
  DmChatRoomCreateRequest,
  DmChatRoomCreateResult,
  ReportRequest,
  ReportResponse,
  ReportPostRequest,
  ReportPostResponse,
  GroupChatJoinResponse,
  LikeToggleResponse,
  MeetingDetailResponse,
  createGroupPost,
  getPosts,
  getGroupDetail,
  joinGroup,
  toggleLike,
  bumpPost,
  createDmChatRoom,
  report,
  reportPost,
  joinGroupChatRoom,
  getMeetingDetail,
} from './api';
import {useQueryClient, InvalidateQueryFilters} from '@tanstack/react-query';

/**
 * 모임 게시글 생성을 위한 React Query 훅
 * @returns useApiMutation 훅의 반환값
 */
export const useCreateGroupPost = () => {
  return useApiMutation<CreateGroupPostResponse, CreateGroupPostRequest>(
    'createGroupPost',
    (data: CreateGroupPostRequest) => createGroupPost(data),
    {
      onSuccess: response => {
        console.log('모임 게시글 생성 성공:', response.data);
      },
      onError: error => {
        console.error('모임 게시글 생성 실패:', error.message);
      },
    },
  );
};

/**
 * 모임 게시글 목록을 무한 스크롤로 가져오기 위한 React Query 훅
 * @param categoryId 필터링할 카테고리 ID (선택 사항)
 * @param size 한 번에 가져올 게시글 수 (기본값: 10)
 * @returns useInfiniteQuery 훅의 반환값
 */
export const useInfinitePosts = (categoryId?: number, size = 10) => {
  return useApiInfiniteQuery<GetPostsResponse>(
    ['posts', categoryId ?? 'all'],

    // 페이지 파라미터를 기반으로 API 호출
    ({pageParam}) =>
      getPosts({
        lastPostId: pageParam as number | undefined,
        size,
        categoryId,
      }),

    // 다음 페이지 파라미터 추출 함수
    {
      getNextPageParam: (lastPage: any) => {
        // 더 이상 데이터가 없으면 undefined 반환 (무한 스크롤 중단)
        if (!lastPage.data.hasNext || lastPage.data.posts.length === 0) {
          return undefined;
        }

        // 마지막 페이지의 마지막 포스트 ID를 다음 페이지 파라미터로 반환
        const lastPostId =
          lastPage.data.posts[lastPage.data.posts.length - 1].postId;
        return lastPostId;
      },

      // 에러 발생 시 콜솔에 로그 출력
      onError: (error: any) => {
        console.error('모임 게시글 목록 조회 실패:', error.message);
      },
    },
  );
};

/**
 * 모임 상세 정보를 가져오기 위한 React Query 훅
 * @param postId 모임 게시글 ID
 * @param options 추가 쿼리 옵션 (enabled 등)
 * @returns useQuery 훅의 반환값
 */
export const useGroupDetail = (
  postId: number,
  options?: {enabled?: boolean},
) => {
  return useApiQuery<GetPostResponse>(
    ['groupDetail', String(postId)],
    () => getGroupDetail(postId),
    {
      retry: 1,
      enabled: options?.enabled !== false && postId > 0,
      ...options,
    },
  );
};

/**
 * 모임 참여를 위한 React Query 훅
 * @returns useApiMutation 훅의 반환값
 */
export const useJoinGroup = () => {
  return useApiMutation<boolean, number>(
    'joinGroup',
    (meetingId: number) => joinGroup(meetingId),
    {
      onSuccess: () => {
        console.log('모임 참여 성공');
      },
      onError: error => {
        console.error('모임 참여 실패:', error.message);
      },
    },
  );
};

/**
 * 좋아요 토글을 위한 React Query 훅 (서버 응답 기반 업데이트)
 * @param postId 게시글 ID
 * @returns useApiMutation 훅의 반환값
 */
export const useToggleLike = (postId: number) => {
  const queryClient = useQueryClient();
  const queryKey = ['groupDetail', String(postId)];

  return useApiMutation<LikeToggleResponse, void>(
    'toggleLike',
    () => toggleLike(postId),
    {
      // 낙관적 업데이트 적용
      onMutate: async () => {
        // 현재 쿼리 데이터 가져오기
        const previousData = queryClient.getQueryData<any>(queryKey);

        if (!previousData) return {previousData};

        // 현재 좋아요 상태를 토글하여 예상 상태 계산
        const currentIsLiked = previousData.data.post.isLiked || false;
        const currentLikeCount = previousData.data.post.likeCount || 0;

        const newIsLiked = !currentIsLiked;
        const newLikeCount = newIsLiked
          ? currentLikeCount + 1
          : currentLikeCount - 1;

        // 낙관적으로 좋아요 상태 업데이트
        const updatedData = {
          ...previousData,
          data: {
            ...previousData.data,
            post: {
              ...previousData.data.post,
              isLiked: newIsLiked,
              likeCount: Math.max(0, newLikeCount), // 음수 방지
            },
          },
        };

        // 업데이트된 데이터로 쿼리 캐시 갱신
        queryClient.setQueryData(queryKey, updatedData);

        // 롤백을 위한 이전 데이터 반환
        return {previousData};
      },

      // 성공 시 서버 응답으로 실제 데이터 업데이트
      onSuccess: response => {
        if (response.data) {
          const previousData = queryClient.getQueryData<any>(queryKey);
          if (previousData) {
            const updatedData = {
              ...previousData,
              data: {
                ...previousData.data,
                post: {
                  ...previousData.data.post,
                  isLiked: response.data.isLiked,
                  likeCount: response.data.likeCount,
                },
              },
            };
            queryClient.setQueryData(queryKey, updatedData);
          }
        }
      },

      // 오류 발생 시 원래 데이터로 롤백
      onError: (error, _, context: any) => {
        console.error('좋아요 토글 실패:', error.message);
        if (context?.previousData) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
      },
    },
  );
};

/**
 * 게시글 끌어올리기를 위한 React Query 훅
 * @returns useApiMutation 훅의 반환값
 */
export const useBumpPost = () => {
  const queryClient = useQueryClient();

  return useApiMutation<void, number>(
    'bumpPost',
    (postId: number) => bumpPost(postId),
    {
      onSuccess: (_, postId) => {
        console.log('게시글 끌어올리기 성공:', postId);

        // 모임 상세 정보 캐시 갱신
        queryClient.invalidateQueries({
          queryKey: ['groupDetail', String(postId)],
        } as InvalidateQueryFilters);

        // 모임 목록 캐시 갱신
        queryClient.invalidateQueries({
          queryKey: ['posts'],
        } as InvalidateQueryFilters);
      },
      onError: (error, postId) => {
        console.error(`게시글 ${postId} 끌어올리기 실패:`, error.message);
      },
    },
  );
};

/**
 * DM 채팅방 생성을 위한 React Query 훅
 * @returns useApiMutation 훅의 반환값
 */
export const useCreateDmChatRoom = () => {
  return useApiMutation<DmChatRoomCreateResult, DmChatRoomCreateRequest>(
    'createDmChatRoom',
    (data: DmChatRoomCreateRequest) => createDmChatRoom(data),
    {
      onSuccess: response => {
        console.log('DM 채팅방 생성 성공:', response.data);
      },
      onError: error => {
        console.error('DM 채팅방 생성 실패:', error.message);
      },
    },
  );
};

/**
 * 새로운 신고 API를 위한 React Query 훅
 * @returns useApiMutation 훅의 반환값
 */
export const useReport = () => {
  return useApiMutation<ReportResponse, ReportRequest>(
    'report',
    (data: ReportRequest) => report(data),
    {
      onSuccess: response => {
        console.log('신고 성공:', response.data);
      },
      onError: error => {
        console.error('신고 실패:', error.message);
      },
    },
  );
};

/**
 * 게시글 신고를 위한 React Query 훅 (기존 호환성을 위해 유지)
 * @returns useApiMutation 훅의 반환값
 */
export const useReportPost = () => {
  return useApiMutation<ReportPostResponse, ReportPostRequest>(
    'reportPost',
    (data: ReportPostRequest) => reportPost(data),
    {
      onSuccess: response => {
        console.log('게시글 신고 성공:', response.data);
      },
      onError: error => {
        console.error('게시글 신고 실패:', error.message);
      },
    },
  );
};

/**
 * 그룹 채팅방 참여를 위한 React Query 훅
 * @returns useApiMutation 훅의 반환값
 */
export const useJoinGroupChatRoom = () => {
  return useApiMutation<GroupChatJoinResponse, number>(
    'joinGroupChatRoom',
    (meetingId: number) => joinGroupChatRoom(meetingId),
    {
      onSuccess: response => {
        console.log('그룹 채팅방 참여 성공:', response.data);
      },
      onError: error => {
        console.error('그룹 채팅방 참여 실패:', error.message);
      },
    },
  );
};

/**
 * 모임 상세 정보를 가져오기 위한 React Query 훅 (API 문서 기준)
 * @param meetingId 모임 ID
 * @param enabled 쿼리 활성화 여부
 * @returns useQuery 훅의 반환값
 */
export const useMeetingDetail = (meetingId: number, enabled = true) => {
  return useApiQuery<MeetingDetailResponse>(
    ['meetingDetail', String(meetingId)],
    () => getMeetingDetail(meetingId),
    {
      retry: 1,
      enabled: enabled && meetingId > 0,
    },
  );
};
