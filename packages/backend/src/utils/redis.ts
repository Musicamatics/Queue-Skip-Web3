import { createClient } from 'redis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = createClient({
  url: redisUrl,
});

redis.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

// Connect to Redis
redis.connect().catch((err) => {
  logger.error('Failed to connect to Redis:', err);
});

// Cache utilities
export const cacheUtils = {
  // QR Code caching
  async setQRCode(passId: string, qrData: any, ttl: number = 30): Promise<void> {
    await redis.setEx(`qr:${passId}`, ttl, JSON.stringify(qrData));
  },

  async getQRCode(passId: string): Promise<any | null> {
    const data = await redis.get(`qr:${passId}`);
    return data ? JSON.parse(data) : null;
  },

  // Pass caching
  async setPass(passId: string, passData: any, ttl: number = 300): Promise<void> {
    await redis.setEx(`pass:${passId}`, ttl, JSON.stringify(passData));
  },

  async getPass(passId: string): Promise<any | null> {
    const data = await redis.get(`pass:${passId}`);
    return data ? JSON.parse(data) : null;
  },

  async invalidatePass(passId: string): Promise<void> {
    await redis.del(`pass:${passId}`);
    await redis.del(`qr:${passId}`);
  },

  // Venue config caching
  async setVenueConfig(venueId: string, config: any, ttl: number = 3600): Promise<void> {
    await redis.setEx(`venue:${venueId}`, ttl, JSON.stringify(config));
  },

  async getVenueConfig(venueId: string): Promise<any | null> {
    const data = await redis.get(`venue:${venueId}`);
    return data ? JSON.parse(data) : null;
  },

  async invalidateVenueConfig(venueId: string): Promise<void> {
    await redis.del(`venue:${venueId}`);
  },
};

// Graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting from Redis...');
  await redis.disconnect();
});
