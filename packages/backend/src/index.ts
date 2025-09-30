import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Route imports
import authRoutes from './routes/auth';
import passRoutes from './routes/passes';
import venueRoutes from './routes/venues';
import qrRoutes from './routes/qr';
import blockchainRoutes from './routes/blockchain';
import communityRoutes from './routes/community';
import predictionsRoutes from './routes/predictions';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/passes', authMiddleware, passRoutes);
app.use('/api/venues', venueRoutes); // Public - no auth required for listing
app.use('/api/qr', authMiddleware, qrRoutes);
app.use('/api/blockchain', authMiddleware, blockchainRoutes);
app.use('/api/community', authMiddleware, communityRoutes);
app.use('/api/predictions', predictionsRoutes); // Public viewing, auth only for survey submission

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`WebSocket client connected: ${socket.id}`);

  socket.on('join-venue', (venueId: string) => {
    socket.join(`venue-${venueId}`);
    logger.info(`Client ${socket.id} joined venue ${venueId}`);
  });

  socket.on('join-pass', (passId: string) => {
    socket.join(`pass-${passId}`);
    logger.info(`Client ${socket.id} joined pass ${passId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`WebSocket client disconnected: ${socket.id}`);
  });
});

// Store io instance globally for use in services
declare global {
  var io: SocketIOServer;
}
global.io = io;

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      timestamp: new Date(),
      requestId: req.headers['x-request-id'] || 'unknown',
      retryable: false,
    },
  });
});

server.listen(PORT, () => {
  logger.info(`🚀 Queue Skip Web3 API server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 CORS origins: ${process.env.CORS_ORIGIN}`);
});

export { app, server, io };
