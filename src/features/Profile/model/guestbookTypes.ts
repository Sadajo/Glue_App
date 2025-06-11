// 사용자 요약 정보
export interface UserSummary {
  userId: number;
  userNickname: string;
  profileImageUrl: string | null;
}

// 방명록 응답 타입
export interface GuestBookResponse {
  id: number;
  writer: UserSummary;
  content: string;
  canShow: boolean;
  createdAt: string;
}

// 방명록 스레드 응답 타입 (답글 포함)
export interface GuestBookThreadResponse {
  id: number;
  writer: UserSummary;
  content: string;
  secret: boolean;
  createdAt: string;
  child: GuestBookThreadResponse | null;
}

// 새로운 API 스펙에 맞는 방명록 아이템 타입
export interface GuestBookItem {
  id: number;
  writer: {
    userId: number;
    userNickname: string;
    profileImageUrl: string;
  };
  content: string;
  secret: boolean;
  createdAt: string;
  child: string;
}

// 새로운 API 응답 타입
export interface GuestBookApiResponse {
  httpStatus: {
    error: boolean;
    is4xxClientError: boolean;
    is5xxServerError: boolean;
    is1xxInformational: boolean;
    is2xxSuccessful: boolean;
    is3xxRedirection: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: GuestBookItem[];
}

// 방명록 작성 요청 타입
export interface CreateGuestBookRequest {
  content: string;
  hostId: number;
  parentId?: number;
  secret: boolean;
}

// 방명록 수정 요청 타입
export interface UpdateGuestBookRequest {
  content?: string;
  secret?: boolean;
}

// 방명록 조회 파라미터
export interface GetGuestBooksParams {
  hostId: number;
  cursorId?: number;
  pageSize?: number;
}
