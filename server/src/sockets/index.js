import { Server } from 'socket.io';
import registerSocketHandlers from './socketHandler.js';

/**
 * Attaches Socket.IO to the HTTP server and wires up all event handlers.
 *
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
const initSocket = (httpServer) => {
   const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',  // CRA
    'http://localhost:5173',  // Vite
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin:  allowedOrigins,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);
    registerSocketHandlers(socket, io);
  });

  return io;
};

export default initSocket;