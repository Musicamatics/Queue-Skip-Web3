import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { createAppError } from '../middleware/errorHandler';
import { createSuccessResponse, createErrorResponse, ERROR_CODES } from '@queue-skip/shared';

const router = Router();

/**
 * POST /api/auth/login
 * Multi-method authentication with auto-registration support
 */
router.post('/login', async (req, res, next) => {
  try {
    const { method, email, governmentId, ssoToken, web3Address, venueId, isAdmin, userGroup } = req.body;

    let user;
    let userAssociation;
    let isNewUser = false;

    // Find or create user based on method
    switch (method) {
      case 'email':
        if (!email) {
          throw createAppError('Email is required', 400, ERROR_CODES.VALIDATION_ERROR);
        }
        user = await prisma.user.findUnique({ where: { email } });
        
        // Auto-registration logic
        if (!user && venueId) {
          const venue = await prisma.venue.findUnique({ where: { id: venueId } });
          if (venue && (venue.config as any).features?.allowAutoRegistration) {
            logger.info(`Auto-registering new user with email: ${email}`);
            user = await prisma.user.create({
              data: { email },
            });
            isNewUser = true;
          }
        }
        break;

      case 'government_id':
        if (!governmentId) {
          throw createAppError('Government ID is required', 400, ERROR_CODES.VALIDATION_ERROR);
        }
        user = await prisma.user.findUnique({ where: { governmentId } });
        
        // Auto-registration logic
        if (!user && venueId) {
          const venue = await prisma.venue.findUnique({ where: { id: venueId } });
          if (venue && (venue.config as any).features?.allowAutoRegistration) {
            logger.info(`Auto-registering new user with government ID: ${governmentId}`);
            user = await prisma.user.create({
              data: { governmentId },
            });
            isNewUser = true;
          }
        }
        break;

      case 'web3_wallet':
        if (!web3Address) {
          throw createAppError('Web3 address is required', 400, ERROR_CODES.VALIDATION_ERROR);
        }
        user = await prisma.user.findUnique({ where: { web3Address } });
        
        // Auto-registration logic
        if (!user && venueId) {
          const venue = await prisma.venue.findUnique({ where: { id: venueId } });
          if (venue && (venue.config as any).features?.allowAutoRegistration) {
            logger.info(`Auto-registering new user with Web3 address: ${web3Address}`);
            user = await prisma.user.create({
              data: { web3Address },
            });
            isNewUser = true;
          }
        }
        break;

      case 'sso':
        if (!ssoToken) {
          throw createAppError('SSO token is required', 400, ERROR_CODES.VALIDATION_ERROR);
        }
        // In production, validate SSO token with the provider
        user = await prisma.user.findUnique({ where: { ssoId: ssoToken } });
        
        // Auto-registration logic
        if (!user && venueId) {
          const venue = await prisma.venue.findUnique({ where: { id: venueId } });
          if (venue && (venue.config as any).features?.allowAutoRegistration) {
            logger.info(`Auto-registering new user with SSO ID: ${ssoToken}`);
            user = await prisma.user.create({
              data: { ssoId: ssoToken },
            });
            isNewUser = true;
          }
        }
        break;

      default:
        throw createAppError('Invalid authentication method', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    if (!user) {
      throw createAppError(
        'User not found. Auto-registration is disabled for this venue.',
        404,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    // Check admin access if admin login requested
    if (isAdmin && user.role !== 'admin' && user.role !== 'super_admin') {
      throw createAppError('Insufficient permissions for admin access', 403, ERROR_CODES.ACCESS_DENIED);
    }

    // Get or create user's venue association if venueId provided
    if (venueId) {
      userAssociation = await prisma.userVenueAssociation.findFirst({
        where: { 
          userId: user.id, 
          venueId,
        },
      });

      // If user is new and no association exists, create one
      if (!userAssociation && isNewUser) {
        const venue = await prisma.venue.findUnique({ where: { id: venueId } });
        if (venue && (venue.config as any).features?.allowAutoRegistration) {
          // Determine user group - use provided group or default
          const defaultGroup = userGroup || 'general';
          
          logger.info(`Creating venue association for new user: ${user.id} at venue: ${venueId}, group: ${defaultGroup}`);
          userAssociation = await prisma.userVenueAssociation.create({
            data: {
              userId: user.id,
              venueId,
              userGroup: defaultGroup,
              role: 'user',
              status: 'active',
            },
          });
        }
      }

      // Check if user is associated with this venue (if not admin/super_admin)
      if (!userAssociation && user.role !== 'admin' && user.role !== 'super_admin') {
        throw createAppError(
          'User not associated with this venue. Please contact an administrator.',
          403,
          ERROR_CODES.INSUFFICIENT_PERMISSIONS
        );
      }

      // Check if association is active
      if (userAssociation && userAssociation.status !== 'active') {
        throw createAppError(
          `Your access to this venue is ${userAssociation.status}. Please contact an administrator.`,
          403,
          ERROR_CODES.ACCESS_DENIED
        );
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createAppError('JWT secret not configured', 500, ERROR_CODES.INTERNAL_ERROR);
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      venueId: userAssociation?.venueId,
      userGroup: userAssociation?.userGroup,
      venueRole: userAssociation?.role,
    };

    const accessToken = jwt.sign(tokenPayload, jwtSecret, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    });

    const refreshToken = jwt.sign(
      { userId: user.id }, 
      jwtSecret, 
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    logger.info(`User ${user.id} authenticated via ${method}${isNewUser ? ' (NEW USER)' : ''}`);

    res.json(createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        venueId: userAssociation?.venueId,
        userGroup: userAssociation?.userGroup,
        venueRole: userAssociation?.role,
        isNewUser,
      },
      accessToken,
      refreshToken,
    }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/register
 * Register new user (manual registration)
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, governmentId, web3Address, ssoId, venueId, userGroup } = req.body;

    // Validate required fields
    if (!email && !governmentId && !web3Address && !ssoId) {
      throw createAppError(
        'At least one authentication method is required',
        400,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          governmentId ? { governmentId } : {},
          web3Address ? { web3Address } : {},
          ssoId ? { ssoId } : {},
        ].filter(condition => Object.keys(condition).length > 0),
      },
    });

    if (existingUser) {
      throw createAppError('User already exists', 409, ERROR_CODES.VALIDATION_ERROR);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        governmentId,
        web3Address,
        ssoId,
      },
    });

    // Create venue association if provided
    if (venueId && userGroup) {
      await prisma.userVenueAssociation.create({
        data: {
          userId: user.id,
          venueId,
          userGroup,
        },
      });
    }

    logger.info(`New user registered: ${user.id}`);

    res.status(201).json(createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    }));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createAppError('Refresh token is required', 400, ERROR_CODES.VALIDATION_ERROR);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createAppError('JWT secret not configured', 500, ERROR_CODES.INTERNAL_ERROR);
    }

    const decoded = jwt.verify(refreshToken, jwtSecret) as any;
    const userId = decoded.userId;

    // Get user and venue association
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        venueAssociations: {
          where: { status: 'active' },
          take: 1,
        },
      },
    });

    if (!user) {
      throw createAppError('User not found', 404, ERROR_CODES.INVALID_CREDENTIALS);
    }

    const venueAssociation = user.venueAssociations[0];

    // Generate new access token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      venueId: venueAssociation?.venueId,
      userGroup: venueAssociation?.userGroup,
      venueRole: venueAssociation?.role,
    };

    const accessToken = jwt.sign(tokenPayload, jwtSecret, { 
      expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
    });

    res.json(createSuccessResponse({ accessToken }));
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createAppError('Invalid refresh token', 401, ERROR_CODES.TOKEN_EXPIRED));
    } else {
      next(error);
    }
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate tokens)
 */
router.post('/logout', async (req, res, next) => {
  try {
    // In production, you might want to maintain a token blacklist
    // For now, we'll just return success as tokens will expire naturally
    
    res.json(createSuccessResponse({ message: 'Logged out successfully' }));
  } catch (error) {
    next(error);
  }
});

export default router;