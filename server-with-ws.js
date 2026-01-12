// Custom Next.js server with WebSocket support
// This file allows us to run WebSocket server alongside Next.js

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { getAnalyticsWebSocketServer } from './lib/websocket/WebSocketServer';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const wsPort = parseInt(process.env.WS_PORT || '8000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server for Next.js
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '', true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Start Next.js server
  server.listen(port, (err?: Error) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  // Start WebSocket server on different port
  const wsServer = getAnalyticsWebSocketServer();
  wsServer.start(wsPort);
  console.log(`> WebSocket ready on ws://${hostname}:${wsPort}`);

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    wsServer.stop();
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    wsServer.stop();
    server.close(() => {
      process.exit(0);
    });
  });
});
