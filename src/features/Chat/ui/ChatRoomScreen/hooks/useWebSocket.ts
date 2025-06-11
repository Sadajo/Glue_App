import {useEffect} from 'react';
import {webSocketService} from '../../../lib/websocket';
import {DmMessageResponse} from '../../../api/api';

export const useWebSocket = (
  dmChatRoomId: number | undefined,
  currentUserId: number | null,
  setMessages: React.Dispatch<React.SetStateAction<DmMessageResponse[]>>,
) => {
  useEffect(() => {
    if (!dmChatRoomId) {
      return;
    }

    let isComponentMounted = true;

    // 메시지 수신 리스너 설정 (이 채팅방 메시지만 필터링)
    webSocketService.setMessageListener((dmMessage: DmMessageResponse) => {
      if (!isComponentMounted) return;

      // 현재 채팅방의 메시지만 처리
      if (dmMessage.dmChatRoomId === dmChatRoomId) {
        setMessages(prev => {
          // 중복 메시지 방지
          const exists = prev.find(
            msg => msg.dmMessageId === dmMessage.dmMessageId,
          );
          if (exists) {
            return prev;
          }

          // 새 메시지 추가 후 시간순으로 정렬 (최신순)
          const newMessages = [dmMessage, ...prev];
          return newMessages.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        });
      }
    });

    // 클린업: 리스너만 제거, 연결은 Provider에서 관리
    return () => {
      isComponentMounted = false;
      webSocketService.setMessageListener(null);
    };
  }, [dmChatRoomId, currentUserId, setMessages]);
};
