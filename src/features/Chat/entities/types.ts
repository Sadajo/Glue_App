export interface ChatRoom {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  memberCount?: number;
  type: 'group' | 'direct'; // 채팅방 타입: 모임톡(그룹) 또는 쪽지(개인)

  // DM 채팅방 추가 정보
  dmChatRoomId?: number;
  meetingId?: number;
  otherUser?: {
    userId: number;
    userName: string;
    profileImageUrl: string | null;
  };

  // 그룹 채팅방 추가 정보
  groupChatroomId?: number;
  meeting?: {
    meetingId: number;
    meetingTitle: string;
    meetingImageUrl: string;
    currentParticipants: number;
  };
}

export interface ChatState {
  rooms: ChatRoom[];
  loading: boolean;
  error: string | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  readCount?: number;
}

export interface ChatUser {
  id: string;
  name: string;
  isHost?: boolean;
  profileImage: string;
  isOnline?: boolean;
  hostIconImage?: string;
}

export interface ChatDetails {
  id: string;
  name: string;
  roomIcon?: string;
  memberCount: number;
  users: ChatUser[];
  messages: ChatMessage[];
  currentUserId: string;
  type?: 'group' | 'direct'; // 채팅방 타입: 모임톡(그룹) 또는 쪽지(개인)
}
