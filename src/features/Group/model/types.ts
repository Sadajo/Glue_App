import {StackNavigationProp} from '@react-navigation/stack';

/**
 * 그룹 목록 아이템 타입
 */
export interface GroupItem {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  categoryTextColor: string;
  likes: number;
  viewCounts: number;
  participants: string;
  time: string;
  image?: string;
}

/**
 * 그룹 상세 정보 타입
 */
export interface GroupDetail {
  id: string;
  title: string;
  description: string;
  content: string;

  // 작성자 정보
  category: string;
  authorName: string;
  authorDate: string;
  authorAvatarUrl: string;
  likes: number;

  // 모임 정보
  capacity: string;
  language: string;
  minForeigners: string;
  meetingDate: string;

  // 이미지
  imageUrl?: string;
}

/**
 * 그룹 액션 타입
 */
export type GroupAction =
  | {type: 'FETCH_GROUP_DETAIL_REQUEST'; payload: {id: string}}
  | {type: 'FETCH_GROUP_DETAIL_SUCCESS'; payload: GroupDetail}
  | {type: 'FETCH_GROUP_DETAIL_FAILURE'; payload: string}
  | {type: 'FETCH_GROUP_LIST_REQUEST'; payload?: {page?: string}}
  | {
      type: 'FETCH_GROUP_LIST_SUCCESS';
      payload: {groups: GroupItem[]; hasMore: boolean; nextPage?: string};
    }
  | {type: 'FETCH_GROUP_LIST_FAILURE'; payload: string}
  | {type: 'LIKE_GROUP_REQUEST'; payload: {id: string}}
  | {type: 'LIKE_GROUP_SUCCESS'; payload: {id: string}}
  | {type: 'LIKE_GROUP_FAILURE'; payload: string}
  | {type: 'JOIN_GROUP_REQUEST'; payload: {id: string}}
  | {type: 'JOIN_GROUP_SUCCESS'; payload: {id: string}}
  | {type: 'JOIN_GROUP_FAILURE'; payload: string};

/**
 * 그룹 상태 타입
 */
export interface GroupState {
  detail: {
    data: GroupDetail | null;
    loading: boolean;
    error: string | null;
  };

  list: {
    data: GroupItem[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    nextPage?: string;
  };
}

// 네비게이션 타입 정의
export type GroupStackParamList = {
  GroupList: undefined;
  GroupDetail: {postId: string | number};
  CreateGroup: undefined;
  GroupSearch: undefined;
  UserProfile: {userId: number};
  GroupCreate: undefined;
  GroupCreateStep2: undefined;
  GroupCreateStep3: undefined;
  GroupCreateStep4: undefined;
  EditGroup: {postId: string | number};
  Guestbook: {userId: number; userNickname: string};
};

export type GroupListNavigationProp = StackNavigationProp<GroupStackParamList>;

export interface GroupListProps {
  navigation: GroupListNavigationProp;
}

export interface GroupDetailProps {
  navigation: any; // Use any for cross-stack navigation
  route: {
    params: {
      postId: string | number;
    };
  };
}

// 모임 아이템 프롭스 타입
export interface GroupItemProps {
  item: GroupItem;
  onPress: (id: string) => void;
}
