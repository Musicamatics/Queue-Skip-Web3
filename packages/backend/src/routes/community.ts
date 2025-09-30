import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAppError } from '../middleware/errorHandler';
import { createSuccessResponse, ERROR_CODES } from '@queue-skip/shared';
import { prisma } from '../utils/database';

const router = Router();

/**
 * GET /api/community/donations/:venueId
 * Get donation requests for a venue
 */
router.get('/donations/:venueId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { venueId } = req.params;

    const donations = await prisma.donationRequest.findMany({
      where: { 
        venueId,
        status: 'open'
      },
      include: {
        user: {
          select: { id: true, email: true }
        }
      },
      orderBy: [
        { upvotes: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(createSuccessResponse({ donations }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/community/donations
 * Create donation request
 */
router.post('/donations', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    const { venueId, reason } = req.body;

    if (!userId) {
      throw createAppError('User not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (!venueId || !reason) {
      throw createAppError('Venue ID and reason are required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const donation = await prisma.donationRequest.create({
      data: {
        userId,
        venueId,
        reason,
      },
      include: {
        user: {
          select: { id: true, email: true }
        }
      }
    });

    res.status(201).json(createSuccessResponse({ donation }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/community/donations/:donationId/upvote
 * Upvote donation request
 */
router.post('/donations/:donationId/upvote', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    const { donationId } = req.params;

    if (!userId) {
      throw createAppError('User not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    const donation = await prisma.donationRequest.update({
      where: { id: donationId },
      data: {
        upvotes: {
          increment: 1
        }
      }
    });

    res.json(createSuccessResponse({ 
      donation,
      message: 'Donation request upvoted'
    }));
  } catch (error) {
    next(error);
  }
});

export default router;
