import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createAppError } from './errorHandler';
import { ERROR_CODES } from '@queue-skip/shared';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    venueId?: string;
    userGroup?: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw createAppError(
        'Access token is required',
        401,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createAppError(
        'JWT secret not configured',
        500,
        ERROR_CODES.INTERNAL_ERROR
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      venueId: decoded.venueId,
      userGroup: decoded.userGroup,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createAppError(
        'Invalid or expired token',
        401,
        ERROR_CODES.TOKEN_EXPIRED
      ));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next();
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      venueId: decoded.venueId,
      userGroup: decoded.userGroup,
    };

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};
