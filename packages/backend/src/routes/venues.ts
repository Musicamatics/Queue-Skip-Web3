import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { createAppError } from '../middleware/errorHandler';
import { createSuccessResponse, ERROR_CODES } from '@queue-skip/shared';
import { prisma } from '../utils/database';

const router = Router();

/**
 * GET /api/venues
 * Get all venues (public endpoint)
 */
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const venues = await prisma.venue.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        config: true,
      },
    });

    res.json(createSuccessResponse({ venues }));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/venues/:venueId
 * Get specific venue details
 */
router.get('/:venueId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { venueId } = req.params;

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        passTypes: true,
        passAllocations: true,
      },
    });

    if (!venue) {
      throw createAppError('Venue not found', 404, ERROR_CODES.VALIDATION_ERROR);
    }

    res.json(createSuccessResponse({ venue }));
  } catch (error) {
    next(error);
  }
});

export default router;
