import { ApiError, ApiResponse } from './types';
import { ERROR_CODES } from './constants';

// API Response Helpers
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  retryable: boolean = false
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date(),
      requestId: generateRequestId(),
      retryable,
    },
  };
}

// Utility Functions
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generatePassId(): string {
  return `pass_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateVenueId(): string {
  return `venue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidGovernmentId(id: string): boolean {
  // Basic validation - can be extended based on regional requirements
  return id.length >= 6 && id.length <= 20 && /^[A-Za-z0-9]+$/.test(id);
}

export function isValidWeb3Address(address: string): boolean {
  // Basic Solana address validation
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

// Date/Time Utilities
export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function isExpired(date: Date): boolean {
  return date.getTime() < Date.now();
}

export function formatTimeSlot(date: Date): string {
  return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
}

// Validation Helpers
export function validatePassTransfer(
  passTransferEnabled: boolean,
  passTransferable: boolean
): { valid: boolean; error?: string } {
  if (!passTransferEnabled) {
    return {
      valid: false,
      error: ERROR_CODES.TRANSFER_DISABLED
    };
  }
  
  if (!passTransferable) {
    return {
      valid: false,
      error: ERROR_CODES.PASS_NOT_TRANSFERABLE
    };
  }
  
  return { valid: true };
}

// Crypto/Security Utilities
export function generateSecureToken(): string {
  // In production, use crypto.randomBytes or similar
  return Math.random().toString(36).substr(2, 32);
}

export function hashToken(token: string): string {
  // Placeholder - implement proper hashing in production
  return `hash_${token}`;
}
