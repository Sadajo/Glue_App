import {DmMessageResponse} from '../../api/api';

export interface ChatRoomScreenProps {
  route?: {
    params: {
      roomId?: string;
      dmChatRoomId?: number;
    };
  };
  navigation?: any;
}

export interface UserInfo {
  userId: number;
  userName: string;
  profileImageUrl: string;
  isHost: boolean;
}

export interface MessageRenderItem {
  item: DmMessageResponse;
}
