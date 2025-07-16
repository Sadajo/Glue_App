// 모임 카드 데이터 타입
export interface MeetingCardProps {
  postId: number;
  category: string;
  categoryColor: string;
  categoryBgColor: string;
  date: string;
  viewCount: string;
  title: string;
  description: string;
  likeCount: string;
  memberCount: string;
}

// 카테고리 섹션 프롭스 타입
export interface CategorySectionProps {
  title: string;
  cards: MeetingCardProps[];
}
