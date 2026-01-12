// useRealtimeAnalytics Hook
// Subscribe to real-time analytics updates via WebSocket

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface AnalyticsUpdate {
  type: string;
  data: any;
  timestamp: number;
}

interface HookOptions {
  url?: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  autoSubscribe?: boolean;
}

export function useRealtimeAnalytics(options: HookOptions = {}) {
  const {
    url = typeof window !== 'undefined'
      ? `ws://${window.location.hostname}:8000`
      : 'ws://localhost:8000',
    reconnectAttempts = 5,
    reconnectDelay = 3000,
    autoSubscribe = true,
  } = options;

  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<AnalyticsUpdate | null>(null);
  const [updates, setUpdates] = useState<AnalyticsUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set(autoSubscribe ? ['realtime'] : []));
  const messageQueueRef = useRef<any[]>([]);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // Don't reconnect if already connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
      }

      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[Analytics] WebSocket connected');
        setConnected(true);
        setError(null);
        reconnectCountRef.current = 0;

        // Process queued messages
        while (messageQueueRef.current.length > 0) {
          const msg = messageQueueRef.current.shift();
          try {
            ws.send(JSON.stringify(msg));
          } catch (err) {
            console.error('[Analytics] Error sending queued message:', err);
          }
        }

        // Resubscribe to topics
        for (const topic of subscriptionsRef.current) {
          try {
            ws.send(
              JSON.stringify({
                action: 'subscribe',
                topic,
              })
            );
          } catch (err) {
            console.error('[Analytics] Error resubscribing:', err);
          }
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle batch updates
          if (data.type === 'events_batch' && Array.isArray(data.data)) {
            setUpdates((prev) => [...prev, ...data.data].slice(-100)); // Keep last 100
            setLastUpdate(data.data[data.data.length - 1]);
          } else if (data.type === 'event') {
            setUpdates((prev) => [...prev, data.data].slice(-100));
            setLastUpdate(data.data);
          } else {
            // Other message types (welcome, subscribed, etc.)
            setLastUpdate(data);
          }
        } catch (err) {
          console.error('[Analytics] Error parsing message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[Analytics] WebSocket error:', event);
        setError('Connection error');
      };

      ws.onclose = () => {
        console.log('[Analytics] WebSocket closed');
        setConnected(false);

        // Attempt reconnection
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          console.log(
            `[Analytics] Reconnecting... (attempt ${reconnectCountRef.current})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay * reconnectCountRef.current);
        } else {
          setError('Connection failed. Max reconnection attempts reached.');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[Analytics] Connection error:', err);
      setError('Failed to connect');
    }
  }, [url, reconnectAttempts, reconnectDelay]);

  /**
   * Subscribe to a topic
   */
  const subscribe = useCallback((topic: string) => {
    subscriptionsRef.current.add(topic);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            action: 'subscribe',
            topic,
          })
        );
      } catch (err) {
        console.error('[Analytics] Error subscribing:', err);
      }
    } else {
      // Queue for later
      messageQueueRef.current.push({
        action: 'subscribe',
        topic,
      });
    }
  }, []);

  /**
   * Unsubscribe from a topic
   */
  const unsubscribe = useCallback((topic: string) => {
    subscriptionsRef.current.delete(topic);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            action: 'unsubscribe',
            topic,
          })
        );
      } catch (err) {
        console.error('[Analytics] Error unsubscribing:', err);
      }
    }
  }, []);

  /**
   * Send ping to keep connection alive
   */
  const ping = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            action: 'ping',
          })
        );
      } catch (err) {
        console.error('[Analytics] Error sending ping:', err);
      }
    }
  }, []);

  /**
   * Disconnect
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
  }, []);

  /**
   * Initialize connection on mount
   */
  useEffect(() => {
    connect();

    // Setup heartbeat ping
    const pingInterval = setInterval(() => {
      ping();
    }, 30000); // Ping every 30 seconds

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, ping]);

  return {
    // State
    connected,
    lastUpdate,
    updates,
    error,

    // Methods
    subscribe,
    unsubscribe,
    ping,
    disconnect,
    connect,

    // Utilities
    isConnected: connected,
    hasError: error !== null,
  };
}
