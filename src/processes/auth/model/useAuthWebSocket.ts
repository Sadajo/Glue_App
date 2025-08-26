import {useEffect} from 'react';
import {useWebSocket} from '@/app/providers/websocket';
import {logger} from '@/shared/lib/logger';

interface UseAuthWebSocketProps {
  isAuthenticated: boolean;
  user?: {
    id: string;
  } | null;
}

/**
 * 인증 상태에 따라 WebSocket 연결을 자동으로 관리하는 훅
 */
export const useAuthWebSocket = ({
  isAuthenticated,
  user,
}: UseAuthWebSocketProps) => {
  const {connect, disconnect, status} = useWebSocket();

  useEffect(() => {
    const handleWebSocketConnection = async () => {
      if (isAuthenticated && user?.id) {
        try {
          // 사용자 ID를 숫자로 변환 (필요한 경우)
          const userId = parseInt(user.id, 10);

          if (!isNaN(userId)) {
            logger.info(`인증됨: WebSocket 연결 시도 (userId: ${userId})`);
            const connected = await connect(userId);

            if (connected) {
              logger.info('WebSocket 연결 성공');
            } else {
              logger.warn('WebSocket 연결 실패');
            }
          } else {
            logger.error('유효하지 않은 사용자 ID:', user.id);
          }
        } catch (error) {
          logger.error('WebSocket 연결 중 오류:', error);
        }
      } else if (!isAuthenticated) {
        logger.info('인증되지 않음: WebSocket 연결 해제');
        disconnect();
      }
    };

    handleWebSocketConnection();
  }, [isAuthenticated, user?.id, connect, disconnect]);

  return {
    webSocketStatus: status,
  };
};
