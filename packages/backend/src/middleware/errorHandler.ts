import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { createErrorResponse } from '@queue-skip/shared';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  retryable?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('API Error:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const retryable = error.retryable || false;

  const errorResponse = createErrorResponse(
    code,
    error.message || 'An unexpected error occurred',
    undefined,
    retryable
  );

  res.status(statusCode).json(errorResponse);
};

export const createAppError = (
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR',
  retryable: boolean = false
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  error.retryable = retryable;
  return error;
};
