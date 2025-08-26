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

// 방명록 작성 요청 타입
export interface CreateGuestBookRequest {
  content: string;
  hostId: number;
  parentId?: number;
  secret: boolean;
}

// 방명록 수정 요청 타입
export interface UpdateGuestBookRequest {
  content: string;
  secret: boolean;
}

// 방명록 조회 파라미터
export interface GetGuestBooksParams {
  hostId: number;
  cursorId?: number;
  pageSize?: number;
}
