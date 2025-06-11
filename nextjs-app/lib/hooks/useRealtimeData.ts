'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface RealtimeMessage {
  type: 'heartbeat' | 'energy_update' | 'solar_update' | 'greenhouse_update';
  timestamp: string;
  data?: unknown;
}

interface UseRealtimeDataOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useRealtimeData(options: UseRealtimeDataOptions = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource('/api/realtime/sse');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('🔗 실시간 연결 성공');
        setIsConnected(true);
        setConnectionError(null);
        setReconnectAttempts(0);
      };

      eventSource.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          if (message.type !== 'heartbeat') {
            console.log('📡 실시간 데이터 수신:', message.type, message.data);
          }
        } catch (error) {
          console.error('실시간 메시지 파싱 오류:', error);
        }
      };

      eventSource.onerror = (_error) => {
        console.error('실시간 연결 오류');
        setIsConnected(false);
        setConnectionError('실시간 연결에 문제가 발생했습니다.');

        // 재연결 시도
        if (reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`재연결 시도 ${reconnectAttempts + 1}/${maxReconnectAttempts}`);
            connect();
          }, reconnectInterval);
        } else {
          console.error('최대 재연결 시도 횟수 초과');
          setConnectionError('실시간 연결을 복구할 수 없습니다.');
        }
      };
    } catch (error) {
      console.error('실시간 연결 초기화 오류:', error);
      setConnectionError('실시간 연결을 시작할 수 없습니다.');
    }
  }, [reconnectAttempts, maxReconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setLastMessage(null);
    setConnectionError(null);
    setReconnectAttempts(0);
    console.log('🔌 실시간 연결 해제');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setReconnectAttempts(0);
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  // 자동 연결
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // 페이지 가시성 변경 시 처리
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // 페이지가 숨겨졌을 때는 연결 유지
        console.log('📱 페이지 숨김 - 연결 유지');
      } else {
        // 페이지가 다시 보일 때 연결 상태 확인
        console.log('👁️ 페이지 표시 - 연결 상태 확인');
        if (!isConnected && autoConnect) {
          reconnect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, autoConnect, reconnect]);

  return {
    isConnected,
    lastMessage,
    connectionError,
    reconnectAttempts,
    maxReconnectAttempts,
    connect,
    disconnect,
    reconnect,
  };
}

// 특정 타입의 메시지만 필터링하는 훅
export function useRealtimeDataByType(
  type: RealtimeMessage['type'],
  options?: UseRealtimeDataOptions
) {
  const { lastMessage, ...rest } = useRealtimeData(options);
  const [filteredData, setFilteredData] = useState<unknown>(null);

  useEffect(() => {
    if (lastMessage && lastMessage.type === type) {
      setFilteredData(lastMessage.data);
    }
  }, [lastMessage, type]);

  return {
    data: filteredData,
    lastMessage,
    ...rest,
  };
} 