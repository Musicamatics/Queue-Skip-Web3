import { Router } from 'express';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { createAppError } from '../middleware/errorHandler';
import { ERROR_CODES, createSuccessResponse } from '@queue-skip/shared';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/predictions/:venueId
 * Get usage predictions for a venue (public - no auth required for viewing)
 */
router.get('/:venueId', async (req, res, next) => {
  try {
    const { venueId } = req.params;
    const { date } = req.query;

    // Default to tomorrow if no date provided
    let targetDate = new Date();
    if (date) {
      targetDate = new Date(date as string);
    } else {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get predictions for the target date
    const predictions = await prisma.usagePrediction.findMany({
      where: {
        venueId,
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate total expected passes
    const totalPasses = predictions.reduce((sum, p) => sum + p.expectedPasses, 0);

    // Find top 3 busiest slots
    const topSlots = [...predictions]
      .sort((a, b) => b.expectedPasses - a.expectedPasses)
      .slice(0, 3)
      .map(p => p.timeSlot);

    res.json(createSuccessResponse({
      predictions,
      summary: {
        date: targetDate,
        totalExpectedPasses: totalPasses,
        busiestSlots: topSlots,
        totalSlots: predictions.length,
      },
    }));
  } catch (error) {
    logger.error('Error fetching predictions:', error);
    next(error);
  }
});

/**
 * POST /api/predictions/survey
 * Submit survey response for intended usage time
 */
router.post('/survey', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    const { venueId, timeSlot, passId } = req.body;

    if (!userId) {
      throw createAppError('User not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (!venueId || !timeSlot) {
      throw createAppError(
        'Venue ID and time slot are required',
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Validate the pass belongs to the user
    if (passId) {
      const pass = await prisma.pass.findFirst({
        where: {
          id: passId,
          userId,
          venueId,
          status: 'active',
        },
      });

      if (!pass) {
        throw createAppError('Pass not found or invalid', 404, ERROR_CODES.NOT_FOUND);
      }
    }

    // Calculate target date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Parse time slot to add to date
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotDate = new Date(tomorrow);
    slotDate.setHours(hours, minutes || 0, 0, 0);

    // Find or create prediction for this slot
    let prediction = await prisma.usagePrediction.findUnique({
      where: {
        venueId_date_timeSlot: {
          venueId,
          date: slotDate,
          timeSlot,
        },
      },
    });

    if (prediction) {
      // Increment expected passes
      prediction = await prisma.usagePrediction.update({
        where: { id: prediction.id },
        data: {
          expectedPasses: { increment: 1 },
          // Adjust confidence based on sample size
          confidence: Math.min(0.95, prediction.confidence + 0.01),
        },
      });
    } else {
      // Create new prediction
      prediction = await prisma.usagePrediction.create({
        data: {
          venueId,
          date: slotDate,
          timeSlot,
          expectedPasses: 1,
          confidence: 0.5, // Low confidence with just one response
        },
      });
    }

    logger.info(`Survey response recorded: user ${userId}, slot ${timeSlot}`);

    res.json(createSuccessResponse({
      message: 'Survey response recorded',
      prediction,
    }));
  } catch (error) {
    logger.error('Error recording survey:', error);
    next(error);
  }
});

/**
 * DELETE /api/predictions/:venueId/reset
 * Reset predictions for a venue (admin only)
 */
router.delete('/:venueId/reset', async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user?.id;
    const { venueId } = req.params;

    if (!userId) {
      throw createAppError('User not authenticated', 401, ERROR_CODES.INVALID_CREDENTIALS);
    }

    // Check if user is admin for this venue
    const userAssociation = await prisma.userVenueAssociation.findFirst({
      where: {
        userId,
        venueId,
        role: { in: ['admin', 'staff'] },
      },
    });

    if (!userAssociation) {
      throw createAppError(
        'Insufficient permissions',
        403,
        ERROR_CODES.INSUFFICIENT_PERMISSIONS
      );
    }

    // Delete all predictions for this venue
    const result = await prisma.usagePrediction.deleteMany({
      where: { venueId },
    });

    logger.info(`Reset ${result.count} predictions for venue ${venueId}`);

    res.json(createSuccessResponse({
      message: `Reset ${result.count} predictions`,
      count: result.count,
    }));
  } catch (error) {
    logger.error('Error resetting predictions:', error);
    next(error);
  }
});

export default router;
