import 'text-encoding-polyfill';
import {Client, IMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {config} from '@shared/config/env';
import {DmMessageResponse, GroupMessageResponse} from '../api/api';
import {secureStorage} from '@shared/lib/security';

export type WebSocketStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

class WebSocketService {
  private client: Client | null = null;
  private status: WebSocketStatus = 'disconnected';
  private messageListener: ((message: DmMessageResponse) => void) | null = null;
  private groupMessageListener:
    | ((message: GroupMessageResponse) => void)
    | null = null;
  private statusChangeListener: ((status: WebSocketStatus) => void) | null =
    null;
  private userId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private groupChatRoomSubscriptions = new Map<number, any>(); // 그룹 채팅방 구독 관리

  constructor() {
    // WebSocket 서비스 초기화
  }

  // WebSocket 연결
  async connectWebSocket(userId: number): Promise<boolean> {
    if (this.client?.connected) {
      console.log('[WebSocketService] 이미 연결됨');
      return true;
    }

    this.userId = userId;
    this.setStatus('connecting');

    try {
      // JWT 토큰 가져오기
      const token = await secureStorage.getToken();

      // STOMP 클라이언트 생성 (SockJS 사용)
      const wsUrl = token
        ? `${config.API_URL}/ws?token=${encodeURIComponent(token)}`
        : `${config.API_URL}/ws`;

      this.client = new Client({
        webSocketFactory: () => {
          return new SockJS(wsUrl);
        },
        connectHeaders: {
          Authorization: token ? `Bearer ${token}` : '',
          userId: userId.toString(),
        },
        debug: str => {
          // 에러만 로그 출력
          if (str.includes('ERROR')) {
            console.error('[STOMP Error]', str);
          }
        },
        reconnectDelay: 0, // 자동 재연결 비활성화 (디버깅용)
        heartbeatIncoming: 0, // 하트비트 비활성화 (React Native 호환성)
        heartbeatOutgoing: 0,
        connectionTimeout: 15000, // 연결 타임아웃 15초로 단축 (빠른 실패)
        // React Native 호환성을 위한 추가 설정
        forceBinaryWSFrames: false, // 텍스트 프레임 사용 (React Native 호환성)
        appendMissingNULLonIncoming: true, // 들어오는 메시지에 NULL 추가
        splitLargeFrames: true, // 큰 프레임 분할
      });

      // 연결 성공 이벤트
      this.client.onConnect = _frame => {
        this.setStatus('connected');
        this.reconnectAttempts = 0;

        // DM 메시지 구독
        const subscriptionPath = `/queue/dm/${userId}`;
        this.client?.subscribe(subscriptionPath, (message: IMessage) => {
          try {
            const dmMessage: DmMessageResponse = JSON.parse(message.body);
            this.messageListener?.(dmMessage);
          } catch (error) {
            console.error('[WebSocketService] 메시지 파싱 에러:', error);
          }
        });
      };

      // 연결 에러 이벤트
      this.client.onStompError = frame => {
        console.error('[WebSocketService] STOMP 에러:', frame.body);
        this.setStatus('error');
      };

      // WebSocket 에러 이벤트
      this.client.onWebSocketError = error => {
        console.error('[WebSocketService] WebSocket 에러:', error);
        this.setStatus('error');
      };

      // WebSocket 연결 종료 이벤트
      this.client.onWebSocketClose = _event => {
        this.setStatus('disconnected');
      };

      // 연결 해제 이벤트
      this.client.onDisconnect = () => {
        this.setStatus('disconnected');

        // 자동 재연결 시도
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            if (this.userId) {
              this.connectWebSocket(this.userId);
            }
          }, 3000 * this.reconnectAttempts);
        }
      };

      // 연결 시작
      try {
        this.client.activate();
      } catch (error) {
        console.error(
          '[WebSocketService] STOMP 클라이언트 활성화 실패:',
          error,
        );
        this.setStatus('error');
        return false;
      }

      // 연결 완료 대기 (30초 타임아웃)
      return new Promise(resolve => {
        const timeout = setTimeout(() => {
          this.setStatus('error');
          resolve(false);
        }, 30000);

        const checkConnection = () => {
          if (this.client?.connected) {
            clearTimeout(timeout);
            resolve(true);
          } else if (this.status === 'error') {
            clearTimeout(timeout);
            resolve(false);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    } catch (error) {
      console.error('[WebSocketService] 연결 실패:', error);
      this.setStatus('error');
      return false;
    }
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.client?.connected || false;
  }

  // 연결 대기
  async waitForConnection(timeout: number = 10000): Promise<boolean> {
    if (this.isConnected()) {
      return true;
    }

    return new Promise(resolve => {
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);

      const checkConnection = () => {
        if (this.isConnected()) {
          clearTimeout(timeoutId);
          resolve(true);
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      checkConnection();
    });
  }

  // 재연결
  async reconnect(): Promise<void> {
    this.disconnect();
    if (this.userId) {
      await this.connectWebSocket(this.userId);
    }
  }

  // 연결 해제
  disconnect(): void {
    // 모든 그룹 채팅방 구독 해제
    this.unsubscribeFromAllGroupChatRooms();

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.setStatus('disconnected');
    this.userId = null;
    this.reconnectAttempts = 0;
  }

  // 메시지 리스너 설정
  setMessageListener(
    listener: ((message: DmMessageResponse) => void) | null,
  ): void {
    this.messageListener = listener;
  }

  // 그룹 메시지 리스너 설정
  setGroupMessageListener(
    listener: ((message: GroupMessageResponse) => void) | null,
  ): void {
    this.groupMessageListener = listener;
  }

  // 그룹 채팅방 구독
  subscribeToGroupChatRoom(groupChatroomId: number): boolean {
    if (!this.client?.connected) {
      console.error('[WebSocketService] WebSocket이 연결되지 않음');
      return false;
    }

    // 이미 구독 중인지 확인
    if (this.groupChatRoomSubscriptions.has(groupChatroomId)) {
      console.log(
        `[WebSocketService] 그룹 채팅방 ${groupChatroomId} 이미 구독 중`,
      );
      return true;
    }

    try {
      const subscriptionPath = `/topic/group/${groupChatroomId}`;
      const subscription = this.client.subscribe(
        subscriptionPath,
        (message: IMessage) => {
          try {
            const groupMessage: GroupMessageResponse = JSON.parse(message.body);
            this.groupMessageListener?.(groupMessage);
          } catch (error) {
            console.error('[WebSocketService] 그룹 메시지 파싱 에러:', error);
          }
        },
      );

      this.groupChatRoomSubscriptions.set(groupChatroomId, subscription);
      console.log(
        `[WebSocketService] 그룹 채팅방 ${groupChatroomId} 구독 완료`,
      );
      return true;
    } catch (error) {
      console.error(
        `[WebSocketService] 그룹 채팅방 ${groupChatroomId} 구독 실패:`,
        error,
      );
      return false;
    }
  }

  // 그룹 채팅방 구독 해제
  unsubscribeFromGroupChatRoom(groupChatroomId: number): void {
    const subscription = this.groupChatRoomSubscriptions.get(groupChatroomId);
    if (subscription) {
      try {
        subscription.unsubscribe();
        this.groupChatRoomSubscriptions.delete(groupChatroomId);
        console.log(
          `[WebSocketService] 그룹 채팅방 ${groupChatroomId} 구독 해제 완료`,
        );
      } catch (error) {
        console.error(
          `[WebSocketService] 그룹 채팅방 ${groupChatroomId} 구독 해제 실패:`,
          error,
        );
      }
    }
  }

  // 모든 그룹 채팅방 구독 해제
  unsubscribeFromAllGroupChatRooms(): void {
    this.groupChatRoomSubscriptions.forEach((subscription, groupChatroomId) => {
      try {
        subscription.unsubscribe();
        console.log(
          `[WebSocketService] 그룹 채팅방 ${groupChatroomId} 구독 해제 완료`,
        );
      } catch (error) {
        console.error(
          `[WebSocketService] 그룹 채팅방 ${groupChatroomId} 구독 해제 실패:`,
          error,
        );
      }
    });
    this.groupChatRoomSubscriptions.clear();
  }

  // 상태 변경 리스너 설정
  onConnectionStatusChange(listener: (status: WebSocketStatus) => void): void {
    this.statusChangeListener = listener;
  }

  // 현재 상태 반환
  getStatus(): WebSocketStatus {
    return this.status;
  }

  // 상태 변경
  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.statusChangeListener?.(status);
    }
  }
}

// 싱글톤 인스턴스 생성
export const webSocketService = new WebSocketService();
