import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {webSocketService, WebSocketStatus} from '@/features/Chat/lib/websocket';
import {secureStorage} from '@/shared/lib/security';
import {logger} from '@/shared/lib/logger';

interface WebSocketContextType {
  status: WebSocketStatus;
  isConnected: boolean;
  connect: (userId: number) => Promise<boolean>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  checkAndConnect: () => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined,
);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');

  useEffect(() => {
    // 웹소켓 상태 변경 리스너 설정
    webSocketService.onConnectionStatusChange(newStatus => {
      setStatus(newStatus);
      logger.info(`WebSocket 상태 변경: ${newStatus}`);
    });

    // 앱 시작 시 자동 연결 시도
    const initializeWebSocket = async () => {
      try {
        const token = await secureStorage.getToken();
        const userId = await secureStorage.getUserId();

        if (token && userId) {
          logger.info(
            '토큰과 사용자 ID가 존재하여 WebSocket 연결을 시도합니다.',
          );
          await webSocketService.connectWebSocket(userId);
        } else {
          logger.info(
            '토큰 또는 사용자 ID가 없어 WebSocket 연결을 건너뜁니다.',
          );
        }
      } catch (error) {
        logger.error('WebSocket 초기화 중 오류:', error);
      }
    };

    initializeWebSocket();

    // 주기적으로 토큰 상태를 확인하여 재연결 (로그인/로그아웃 감지)
    const intervalId = setInterval(async () => {
      try {
        const token = await secureStorage.getToken();
        const userId = await secureStorage.getUserId();
        const isConnected = webSocketService.isConnected();

        if (token && userId && !isConnected) {
          logger.info('토큰이 있지만 연결되지 않음. 재연결 시도.');
          await webSocketService.connectWebSocket(userId);
        } else if (!token && isConnected) {
          logger.info('토큰이 없음. 연결 해제.');
          webSocketService.disconnect();
        }
      } catch (error) {
        logger.error('토큰 상태 확인 중 오류:', error);
      }
    }, 5000); // 5초마다 확인

    // 컴포넌트 언마운트 시 정리
    return () => {
      clearInterval(intervalId);
      webSocketService.disconnect();
    };
  }, []);

  const connect = async (userId: number): Promise<boolean> => {
    try {
      logger.info(`WebSocket 연결 시도: userId=${userId}`);
      return await webSocketService.connectWebSocket(userId);
    } catch (error) {
      logger.error('WebSocket 연결 실패:', error);
      return false;
    }
  };

  const disconnect = () => {
    logger.info('WebSocket 연결 해제');
    webSocketService.disconnect();
  };

  const reconnect = async () => {
    logger.info('WebSocket 재연결 시도');
    await webSocketService.reconnect();
  };

  const checkAndConnect = async () => {
    try {
      const token = await secureStorage.getToken();
      const userId = await secureStorage.getUserId();

      if (token && userId && !webSocketService.isConnected()) {
        logger.info('즉시 연결 확인 및 시도');
        await webSocketService.connectWebSocket(userId);
      }
    } catch (error) {
      logger.error('즉시 연결 확인 중 오류:', error);
    }
  };

  const value: WebSocketContextType = {
    status,
    isConnected: status === 'connected',
    connect,
    disconnect,
    reconnect,
    checkAndConnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
