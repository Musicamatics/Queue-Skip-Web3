import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],  // Removed 'query' to prevent log spam
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown - only register once
let disconnectHandlerRegistered = false;

if (!disconnectHandlerRegistered) {
  disconnectHandlerRegistered = true;
  
  const gracefulShutdown = async () => {
    logger.info('Disconnecting from database...');
    await prisma.$disconnect();
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('beforeExit', gracefulShutdown);
}
