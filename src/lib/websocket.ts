// @ts-ignore - sockjs-client doesn't have type definitions
import SockJS from 'sockjs-client';
// @ts-ignore - stomjs doesn't have type definitions
import { Client } from 'stompjs';

interface NotificationMessage {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

class WebSocketService {
  private stompClient: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  connect(userId: string, onNotification: (notification: NotificationMessage) => void) {
    if (this.isConnected) {
      return;
    }

    try {
      // 환경에 따른 WebSocket URL 설정
      const wsUrl = import.meta.env.VITE_WS_URL || 
        (import.meta.env.PROD ? 'https://2025seasonthonteam92be-production.up.railway.app/ws' : 'http://172.21.135.200:8891/ws');
      
      const socket = new SockJS(wsUrl);
      this.stompClient = Client.over(socket);
      
      this.stompClient.connect({}, () => {
        console.log('🔌 WebSocket 연결 성공');
        this.isConnected = true;
        this.reconnectAttempts = 0;

        // 개별 알림 구독
        this.stompClient?.subscribe(`/user/${userId}/queue/notifications`, (message: any) => {
          try {
            const notification = JSON.parse(message.body);
            console.log('🔔 실시간 알림 수신:', notification);
            onNotification(notification);
          } catch (error) {
            console.error('알림 파싱 오류:', error);
          }
        });

        // 전체 알림 구독
        this.stompClient?.subscribe('/topic/notifications', (message: any) => {
          try {
            const notification = JSON.parse(message.body);
            console.log('📢 전체 알림 수신:', notification);
            onNotification(notification);
          } catch (error) {
            console.error('전체 알림 파싱 오류:', error);
          }
        });

      }, (error: any) => {
        console.error('WebSocket 연결 오류:', error);
        this.isConnected = false;
        this.handleReconnect(userId, onNotification);
      });

    } catch (error) {
      console.error('WebSocket 초기화 오류:', error);
      this.handleReconnect(userId, onNotification);
    }
  }

  private handleReconnect(userId: string, onNotification: (notification: NotificationMessage) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 WebSocket 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect(userId, onNotification);
      }, this.reconnectInterval);
    } else {
      console.error('❌ WebSocket 재연결 실패 - 최대 시도 횟수 초과');
    }
  }

  disconnect() {
    if (this.stompClient && this.isConnected) {
      this.stompClient.disconnect(() => {
        console.log('🔌 WebSocket 연결 해제');
        this.isConnected = false;
      });
    }
  }

  sendMessage(destination: string, message: any) {
    if (this.stompClient && this.isConnected) {
      this.stompClient.send(destination, {}, JSON.stringify(message));
    } else {
      console.warn('WebSocket이 연결되지 않았습니다.');
    }
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;