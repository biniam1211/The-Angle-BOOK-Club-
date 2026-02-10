import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import postsRoutes from './routes/posts';
import likesRoutes from './routes/likes';
import commentsRoutes from './routes/comments';
import messagesRoutes from './routes/messages';
import booksRoutes from './routes/books';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

// Initialize app
const app = express();
const httpServer = createServer(app);
const io = new SocketIO(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible in controllers
(app as any).io = io;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/books', booksRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Socket.io authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      username: string;
    };

    (socket as any).user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  const user = (socket as any).user;
  console.log(`User connected: ${user.username} (${user.id})`);

  // Join user's personal room
  socket.join(user.id);

  // Join thread rooms
  socket.on('join_thread', (threadId: string) => {
    socket.join(threadId);
    console.log(`User ${user.username} joined thread ${threadId}`);
  });

  // Leave thread rooms
  socket.on('leave_thread', (threadId: string) => {
    socket.leave(threadId);
    console.log(`User ${user.username} left thread ${threadId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${user.username}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
🚀 Server is running!
📡 API: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
  `);
});

export { app, io };
