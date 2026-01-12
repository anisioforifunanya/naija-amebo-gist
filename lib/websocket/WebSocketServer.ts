// WebSocket Server for Real-Time Analytics
// Manages connections, events, and broadcasts to all connected clients

import { WebSocket, WebSocketServer } from 'ws';

export interface AnalyticsEvent {
  type: 'visitor' | 'click' | 'scroll' | 'page_view' | 'engagement' | 'alert';
  timestamp: number;
  sessionId: string;
  userId?: string;
  data: Record<string, any>;
}

export interface ClientMessage {
  action: 'subscribe' | 'unsubscribe' | 'query' | 'ping';
  topic?: string;
  filters?: Record<string, any>;
  id?: string;
}

interface ClientData {
  subscriptions: Set<string>;
  sessionId: string;
  lastHeartbeat: number;
}

export class AnalyticsWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, ClientData> = new Map();
  private eventQueue: AnalyticsEvent[] = [];
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private broadcastInterval: ReturnType<typeof setInterval> | null = null;
  private maxClients: number = 10000;
  private eventQueueSize: number = 1000;
  private broadcastIntervalMs: number = 100; // Broadcast every 100ms

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Initialize will be called when server starts
    console.log('[Analytics] WebSocket Server initialized (ready for connection)');
  }

  /**
   * Start the WebSocket server
   */
  public start(port: number) {
    try {
      this.wss = new WebSocketServer({ port });

      this.wss.on('connection', (ws: WebSocket) => {
        this.handleClientConnect(ws);
      });

      this.wss.on('error', (error) => {
        console.error('[Analytics] WebSocket Server error:', error);
      });

      // Start heartbeat monitoring
      this.startHeartbeat();

      // Start broadcast loop
      this.startBroadcasting();

      console.log(`[Analytics] WebSocket Server started on port ${port}`);
      console.log(`[Analytics] Broadcasting every ${this.broadcastIntervalMs}ms`);
      return true;
    } catch (error) {
      console.error('[Analytics] Failed to start WebSocket server:', error);
      return false;
    }
  }

  /**
   * Handle new client connection
   */
  private handleClientConnect(ws: WebSocket) {
    const clientId = Math.random().toString(36).substring(7);

    // Check max clients
    if (this.clients.size >= this.maxClients) {
      ws.close(1008, 'Server at capacity');
      return;
    }

    const clientData: ClientData = {
      subscriptions: new Set(['realtime']), // Default subscription
      sessionId: clientId,
      lastHeartbeat: Date.now(),
    };

    this.clients.set(ws, clientData);

    console.log(
      `[Analytics] Client ${clientId} connected. Total: ${this.clients.size}`
    );

    // Send welcome message
    this.sendToClient(ws, {
      type: 'welcome',
      clientId,
      timestamp: Date.now(),
      message: 'Connected to Analytics Server',
    });

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message: ClientMessage = JSON.parse(data.toString());
        this.handleClientMessage(ws, message);
      } catch (error) {
        console.error('[Analytics] Error parsing message:', error);
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      this.clients.delete(ws);
      console.log(
        `[Analytics] Client ${clientId} disconnected. Total: ${this.clients.size}`
      );
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`[Analytics] Client ${clientId} error:`, error);
    });
  }

  /**
   * Handle message from client
   */
  private handleClientMessage(ws: WebSocket, message: ClientMessage) {
    const clientData = this.clients.get(ws);
    if (!clientData) return;

    switch (message.action) {
      case 'subscribe':
        if (message.topic) {
          clientData.subscriptions.add(message.topic);
          this.sendToClient(ws, {
            type: 'subscribed',
            topic: message.topic,
            timestamp: Date.now(),
          });
        }
        break;

      case 'unsubscribe':
        if (message.topic) {
          clientData.subscriptions.delete(message.topic);
          this.sendToClient(ws, {
            type: 'unsubscribed',
            topic: message.topic,
            timestamp: Date.now(),
          });
        }
        break;

      case 'ping':
        clientData.lastHeartbeat = Date.now();
        this.sendToClient(ws, {
          type: 'pong',
          timestamp: Date.now(),
        });
        break;

      case 'query':
        // Handle queries for historical data
        this.handleQuery(ws, message);
        break;
    }
  }

  /**
   * Handle query requests
   */
  private handleQuery(ws: WebSocket, message: ClientMessage) {
    // For now, send recent events from queue
    const recentEvents = this.eventQueue.slice(-100);
    this.sendToClient(ws, {
      type: 'query_response',
      data: recentEvents,
      timestamp: Date.now(),
    });
  }

  /**
   * Emit an analytics event
   */
  public emitEvent(event: AnalyticsEvent) {
    // Add to queue for broadcasting
    this.eventQueue.push(event);

    // Keep queue size manageable
    if (this.eventQueue.length > this.eventQueueSize) {
      this.eventQueue.shift();
    }

    // Optional: Also broadcast immediately for critical events
    if (
      event.type === 'alert' ||
      event.type === 'visitor'
    ) {
      this.broadcastEvent(event);
    }
  }

  /**
   * Broadcast event to matching subscribers
   */
  private broadcastEvent(event: AnalyticsEvent) {
    const topic = `${event.type}_events`;

    for (const [ws, clientData] of this.clients.entries()) {
      if (
        clientData.subscriptions.has('realtime') ||
        clientData.subscriptions.has(topic)
      ) {
        this.sendToClient(ws, {
          type: 'event',
          data: event,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Start heartbeat monitoring (detect dead connections)
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 60 seconds

      for (const [ws, clientData] of this.clients.entries()) {
        if (now - clientData.lastHeartbeat > timeout) {
          console.log(`[Analytics] Closing stale connection: ${clientData.sessionId}`);
          ws.close(1000, 'Heartbeat timeout');
          this.clients.delete(ws);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Start broadcasting loop
   */
  private startBroadcasting() {
    this.broadcastInterval = setInterval(() => {
      if (this.eventQueue.length === 0) return;

      // Batch broadcast all queued events
      const eventsBatch = [...this.eventQueue];
      this.eventQueue = [];

      // Get unique topics from events
      const topics = new Set<string>();
      eventsBatch.forEach((event) => {
        topics.add(`${event.type}_events`);
      });

      // Broadcast to subscribers
      for (const [ws, clientData] of this.clients.entries()) {
        // Check if client is subscribed to any topic
        const isSubscribed = Array.from(topics).some(
          (topic) =>
            clientData.subscriptions.has('realtime') ||
            clientData.subscriptions.has(topic)
        );

        if (isSubscribed && ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(
              JSON.stringify({
                type: 'events_batch',
                data: eventsBatch,
                count: eventsBatch.length,
                timestamp: Date.now(),
              })
            );
          } catch (error) {
            console.error('[Analytics] Error broadcasting:', error);
          }
        }
      }
    }, this.broadcastIntervalMs);
  }

  /**
   * Send message to specific client
   */
  private sendToClient(ws: WebSocket, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('[Analytics] Error sending to client:', error);
      }
    }
  }

  /**
   * Broadcast message to all clients
   */
  public broadcast(data: any) {
    for (const ws of this.clients.keys()) {
      this.sendToClient(ws, data);
    }
  }

  /**
   * Get current stats
   */
  public getStats() {
    return {
      connectedClients: this.clients.size,
      maxClients: this.maxClients,
      queuedEvents: this.eventQueue.length,
      uptime: process.uptime(),
      timestamp: Date.now(),
    };
  }

  /**
   * Stop the server
   */
  public stop() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.broadcastInterval) clearInterval(this.broadcastInterval);

    // Close all client connections
    for (const ws of this.clients.keys()) {
      ws.close(1000, 'Server shutting down');
    }

    if (this.wss) {
      this.wss.close();
    }

    console.log('[Analytics] WebSocket Server stopped');
  }
}

// Singleton instance
let analyticsWsServer: AnalyticsWebSocketServer | null = null;

export function getAnalyticsWebSocketServer(): AnalyticsWebSocketServer {
  if (!analyticsWsServer) {
    analyticsWsServer = new AnalyticsWebSocketServer();
  }
  return analyticsWsServer;
}
