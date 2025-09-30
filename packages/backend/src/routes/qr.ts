import { Router } from 'express';
import { QRService } from '../services/QRService';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAppError } from '../middleware/errorHandler';
import { createSuccessResponse, ERROR_CODES } from '@queue-skip/shared';
import { prisma } from '../utils/database';

const router = Router();
const qrService = new QRService();

/**
 * GET /api/qr/:passId/generate
 * Generate dynamic QR code for a pass
 */
router.get('/:passId/generate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    const { passId } = req.params;

    if (!userId) {
      throw createAppError('User not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    // Verify user owns this pass
    const pass = await prisma.pass.findFirst({
      where: { 
        id: passId, 
        userId,
        status: 'active'
      },
    });

    if (!pass) {
      throw createAppError(
        'Pass not found or not owned by user', 
        404, 
        ERROR_CODES.PASS_NOT_FOUND
      );
    }

    const dynamicQR = await qrService.generateDynamicQR(passId);

    res.json(createSuccessResponse({ qrCode: dynamicQR }));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/qr/:passId/refresh
 * Refresh QR code (called every 30 seconds)
 */
router.get('/:passId/refresh', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { passId } = req.params;

    const refreshedQR = await qrService.refreshQRCode(passId);

    res.json(createSuccessResponse({ qrCode: refreshedQR }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/qr/validate
 * Validate QR code (staff scanner)
 */
router.post('/validate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const staffId = req.user?.id;
    const { qrData } = req.body;

    if (!staffId) {
      throw createAppError('Staff not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (!qrData) {
      throw createAppError('QR data is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    // TODO: Add staff role validation here

    const validation = await qrService.validateQR(qrData, staffId);

    if (validation.valid) {
      res.json(createSuccessResponse({
        valid: true,
        passId: validation.passId,
        userId: validation.userId,
        venueId: validation.venueId,
        message: 'QR code is valid'
      }));
    } else {
      res.status(400).json(createSuccessResponse({
        valid: false,
        error: validation.error,
        message: 'QR code validation failed'
      }));
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/qr/:passId/display
 * Web display for QR code (fallback)
 */
router.get('/:passId/display', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { passId } = req.params;

    const displayUrl = await qrService.getWebQRDisplay(passId);

    res.json(createSuccessResponse({ 
      displayUrl,
      message: 'QR display URL generated'
    }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/qr/token
 * Create timed token for validation
 */
router.post('/token', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { passId, venueId, validFor } = req.body;

    if (!passId || !venueId) {
      throw createAppError(
        'Pass ID and venue ID are required', 
        400, 
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const token = await qrService.createTimedToken(
      passId, 
      venueId, 
      validFor || 30000
    );

    res.json(createSuccessResponse({ 
      token,
      expiresIn: validFor || 30000,
      message: 'Timed token created'
    }));
  } catch (error) {
    next(error);
  }
});

export default router;
