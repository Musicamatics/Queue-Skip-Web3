import QRCode from 'qrcode';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../utils/database';
import { cacheUtils } from '../utils/redis';
import { logger } from '../utils/logger';
import { createAppError } from '../middleware/errorHandler';
import { 
  QRCode as QRCodeType, 
  DynamicQRCode, 
  ERROR_CODES,
  QR_REFRESH_INTERVAL,
  generateSecureToken,
  hashToken 
} from '@queue-skip/shared';

export class QRService {
  private readonly refreshInterval = QR_REFRESH_INTERVAL; // 30 seconds
  private activeTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Generate dynamic QR code with 30-second refresh capability
   */
  async generateDynamicQR(passId: string): Promise<DynamicQRCode> {
    try {
      logger.info(`Generating dynamic QR for pass ${passId}`);

      // Verify pass exists and is active
      const pass = await prisma.pass.findFirst({
        where: { 
          id: passId, 
          status: 'active',
          validUntil: { gt: new Date() }
        },
        include: {
          venue: true,
          user: true,
        },
      });

      if (!pass) {
        throw createAppError(
          'Pass not found or expired',
          404,
          ERROR_CODES.PASS_NOT_FOUND
        );
      }

      // Generate initial QR code
      const currentCode = await this.generateQRCode(passId, pass.venueId);

      // Create dynamic QR response
      const dynamicQR: DynamicQRCode = {
        currentCode,
        refreshUrl: `/api/qr/${passId}/refresh`,
        webDisplayUrl: `/api/qr/${passId}/display`,
        refreshInterval: this.refreshInterval,
      };

      // Start auto-refresh timer
      this.startAutoRefresh(passId);

      // Cache the dynamic QR data
      await cacheUtils.setQRCode(passId, dynamicQR, 60); // Cache for 1 minute

      logger.info(`Dynamic QR generated for pass ${passId}`);
      return dynamicQR;
    } catch (error) {
      logger.error(`Error generating dynamic QR for pass ${passId}:`, error);
      throw error;
    }
  }

  /**
   * Refresh QR code (called every 30 seconds)
   */
  async refreshQRCode(passId: string): Promise<QRCodeType> {
    try {
      // Check if pass is still valid
      const pass = await prisma.pass.findFirst({
        where: { 
          id: passId, 
          status: 'active',
          validUntil: { gt: new Date() }
        },
      });

      if (!pass) {
        // Stop auto-refresh if pass is no longer valid
        this.stopAutoRefresh(passId);
        throw createAppError(
          'Pass no longer valid',
          400,
          ERROR_CODES.PASS_EXPIRED
        );
      }

      // Generate new QR code
      const newQRCode = await this.generateQRCode(passId, pass.venueId);

      // Update cached dynamic QR
      const cachedDynamicQR = await cacheUtils.getQRCode(passId);
      if (cachedDynamicQR) {
        cachedDynamicQR.currentCode = newQRCode;
        await cacheUtils.setQRCode(passId, cachedDynamicQR, 60);
      }

      // Send real-time update to connected clients
      if (global.io) {
        global.io.to(`pass-${passId}`).emit('qrRefresh', {
          passId,
          newQRCode,
          timestamp: new Date(),
        });
      }

      logger.debug(`QR code refreshed for pass ${passId}`);
      return newQRCode;
    } catch (error) {
      logger.error(`Error refreshing QR for pass ${passId}:`, error);
      throw error;
    }
  }

  /**
   * Validate QR code when scanned by staff
   */
  async validateQR(qrData: string, staffId: string): Promise<{
    valid: boolean;
    passId?: string;
    userId?: string;
    venueId?: string;
    error?: string;
  }> {
    try {
      logger.info(`Validating QR code by staff ${staffId}`);

      // Decode the QR data (JWT token)
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw createAppError(
          'JWT secret not configured',
          500,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      let decoded: any;
      try {
        decoded = jwt.verify(qrData, jwtSecret);
      } catch (jwtError) {
        return {
          valid: false,
          error: 'Invalid QR code format',
        };
      }

      const { passId, tokenHash, expiresAt } = decoded;

      // Check if token has expired (should be within 30 seconds)
      if (new Date() > new Date(expiresAt)) {
        return {
          valid: false,
          error: 'QR code has expired',
        };
      }

      // Get current valid token hash from database
      const currentQR = await prisma.qRCode.findFirst({
        where: {
          passId,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!currentQR || currentQR.tokenHash !== tokenHash) {
        return {
          valid: false,
          error: 'QR code is not current or has been tampered with',
        };
      }

      // Validate the pass
      const pass = await prisma.pass.findFirst({
        where: { 
          id: passId, 
          status: 'active',
          validUntil: { gt: new Date() }
        },
        include: {
          user: true,
          venue: true,
        },
      });

      if (!pass) {
        return {
          valid: false,
          error: 'Pass not found or expired',
        };
      }

      logger.info(`QR code validated successfully for pass ${passId}`);

      return {
        valid: true,
        passId: pass.id,
        userId: pass.userId,
        venueId: pass.venueId,
      };
    } catch (error) {
      logger.error('Error validating QR code:', error);
      return {
        valid: false,
        error: 'Internal validation error',
      };
    }
  }

  /**
   * Generate a single QR code with cryptographic signature
   */
  private async generateQRCode(passId: string, venueId: string): Promise<QRCodeType> {
    try {
      // Generate secure token
      const token = generateSecureToken();
      const tokenHash = hashToken(token);
      const expiresAt = new Date(Date.now() + this.refreshInterval);

      // Create signed JWT payload
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw createAppError(
          'JWT secret not configured',
          500,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      const payload = {
        passId,
        venueId,
        tokenHash,
        expiresAt: expiresAt.toISOString(),
        iat: Math.floor(Date.now() / 1000),
      };

      const qrData = jwt.sign(payload, jwtSecret, { expiresIn: '1m' });

      // Create cryptographic signature for additional security
      const signature = crypto
        .createHmac('sha256', jwtSecret)
        .update(qrData)
        .digest('hex');

      // Generate QR code image
      const qrImageBuffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: 'M',
        type: 'png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256,
      });

      // Store QR code data in database for validation
      await prisma.qRCode.create({
        data: {
          passId,
          data: qrData,
          signature,
          tokenHash,
          expiresAt,
        },
      });

      // Clean up expired QR codes for this pass
      await prisma.qRCode.deleteMany({
        where: {
          passId,
          expiresAt: { lt: new Date() },
        },
      });

      const qrCode: QRCodeType = {
        data: qrData,
        imageUrl: `data:image/png;base64,${qrImageBuffer.toString('base64')}`,
        expiresAt,
        signature,
        tokenHash,
      };

      return qrCode;
    } catch (error) {
      logger.error(`Error generating QR code for pass ${passId}:`, error);
      throw error;
    }
  }

  /**
   * Create timed token for specific validation window
   */
  async createTimedToken(
    passId: string, 
    venueId: string, 
    validFor: number = 30000
  ): Promise<string> {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw createAppError(
          'JWT secret not configured',
          500,
          ERROR_CODES.INTERNAL_ERROR
        );
      }

      const payload = {
        passId,
        venueId,
        validFor,
        iat: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(payload, jwtSecret, { 
        expiresIn: Math.floor(validFor / 1000) + 's' 
      });
    } catch (error) {
      logger.error('Error creating timed token:', error);
      throw error;
    }
  }

  /**
   * Get web QR display URL (fallback for non-mobile users)
   */
  async getWebQRDisplay(passId: string): Promise<string> {
    return `/qr-display/${passId}`;
  }

  /**
   * Start auto-refresh timer for a pass
   */
  private startAutoRefresh(passId: string): void {
    // Clear existing timer if any
    this.stopAutoRefresh(passId);

    const timer = setInterval(async () => {
      try {
        await this.refreshQRCode(passId);
      } catch (error) {
        logger.error(`Auto-refresh failed for pass ${passId}:`, error);
        this.stopAutoRefresh(passId);
      }
    }, this.refreshInterval);

    this.activeTimers.set(passId, timer);
    logger.debug(`Auto-refresh started for pass ${passId}`);
  }

  /**
   * Stop auto-refresh timer for a pass
   */
  private stopAutoRefresh(passId: string): void {
    const timer = this.activeTimers.get(passId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(passId);
      logger.debug(`Auto-refresh stopped for pass ${passId}`);
    }
  }

  /**
   * Stop all active timers (for graceful shutdown)
   */
  public stopAllTimers(): void {
    for (const [passId, timer] of this.activeTimers) {
      clearInterval(timer);
      logger.debug(`Stopped timer for pass ${passId}`);
    }
    this.activeTimers.clear();
    logger.info('All QR refresh timers stopped');
  }
}

// Graceful shutdown
process.on('beforeExit', () => {
  const qrService = new QRService();
  qrService.stopAllTimers();
});
