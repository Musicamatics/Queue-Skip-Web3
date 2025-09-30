import { Router } from 'express';
import { PassService } from '../services/PassService';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAppError } from '../middleware/errorHandler';
import { createSuccessResponse, ERROR_CODES } from '@queue-skip/shared';
import { prisma } from '../utils/database';

const router = Router();
const passService = new PassService();

/**
 * GET /api/passes
 * Get user's passes for a venue
 */
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    const venueId = req.query.venueId as string;

    if (!userId) {
      throw createAppError('User not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (!venueId) {
      throw createAppError('Venue ID is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const passes = await passService.getUserPasses(userId, venueId);

    res.json(createSuccessResponse({ passes }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/passes/allocate
 * Allocate passes to user based on venue rules
 */
router.post('/allocate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    const { venueId } = req.body;

    if (!userId) {
      throw createAppError('User not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (!venueId) {
      throw createAppError('Venue ID is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const passes = await passService.allocatePasses(userId, venueId);

    res.json(createSuccessResponse({ 
      passes,
      message: `Allocated ${passes.length} passes` 
    }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/passes/:passId/transfer
 * Transfer pass to another user
 */
router.post('/:passId/transfer', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    const { passId } = req.params;
    const { toUserId } = req.body;

    if (!userId) {
      throw createAppError('User not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (!toUserId) {
      throw createAppError('Recipient user ID is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const result = await passService.transferPass(passId, userId, toUserId);

    res.json(createSuccessResponse({
      transferred: result.success,
      blockchainTxHash: result.blockchainTxHash,
      message: 'Pass transferred successfully'
    }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/passes/:passId/redeem
 * Redeem pass (staff only)
 */
router.post('/:passId/redeem', async (req: AuthenticatedRequest, res, next) => {
  try {
    const staffId = req.user?.id;
    const { passId } = req.params;

    if (!staffId) {
      throw createAppError('Staff not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    // TODO: Add staff role validation here
    // For now, we assume any authenticated user can act as staff

    const result = await passService.redeemPass(passId, staffId);

    res.json(createSuccessResponse({
      redeemed: result.success,
      blockchainTxHash: result.blockchainTxHash,
      message: 'Pass redeemed successfully'
    }));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/passes/:passId
 * Get specific pass details
 */
router.get('/:passId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    const { passId } = req.params;

    if (!userId) {
      throw createAppError('User not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    // Get pass from database
    const pass = await prisma.pass.findFirst({
      where: { 
        id: passId,
        // Allow user to see their own passes or staff to see any pass
        OR: [
          { userId },
          // TODO: Add staff role check here
        ]
      },
      include: {
        user: {
          select: { id: true, email: true }
        },
        venue: {
          select: { id: true, name: true }
        },
        passType: true,
      },
    });

    if (!pass) {
      throw createAppError('Pass not found', 404, ERROR_CODES.PASS_NOT_FOUND);
    }

    const passData = {
      id: pass.id,
      userId: pass.userId,
      venueId: pass.venueId,
      type: pass.passTypeId,
      status: pass.status,
      validFrom: pass.validFrom,
      validUntil: pass.validUntil,
      restrictions: pass.restrictions,
      blockchainTxHash: pass.blockchainTxHash,
      user: pass.user,
      venue: pass.venue,
      passType: pass.passType,
    };

    res.json(createSuccessResponse({ pass: passData }));
  } catch (error) {
    next(error);
  }
});

export default router;
