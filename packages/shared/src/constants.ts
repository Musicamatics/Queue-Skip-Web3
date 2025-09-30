// QR Code Configuration
export const QR_REFRESH_INTERVAL = 30 * 1000; // 30 seconds in milliseconds
export const QR_CODE_SIZE = 256;
export const QR_ERROR_CORRECTION = 'M';

// Blockchain Configuration
export const SOLANA_NETWORK = {
  MAINNET: 'mainnet-beta',
  TESTNET: 'testnet',
  DEVNET: 'devnet',
} as const;

// Pass Configuration
export const PASS_VALIDITY = {
  STANDARD: 24 * 60 * 60 * 1000, // 24 hours
  FAST: 4 * 60 * 60 * 1000,     // 4 hours
  ONE_TIME: 2 * 60 * 60 * 1000, // 2 hours
} as const;

// API Configuration
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  PASSES: '/api/passes',
  VENUES: '/api/venues',
  QR: '/api/qr',
  BLOCKCHAIN: '/api/blockchain',
  COMMUNITY: '/api/community',
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Pass Management
  PASS_NOT_FOUND: 'PASS_NOT_FOUND',
  PASS_ALREADY_REDEEMED: 'PASS_ALREADY_REDEEMED',
  PASS_EXPIRED: 'PASS_EXPIRED',
  TRANSFER_NOT_ALLOWED: 'TRANSFER_NOT_ALLOWED',
  TRANSFER_DISABLED: 'TRANSFER_DISABLED',
  PASS_NOT_TRANSFERABLE: 'PASS_NOT_TRANSFERABLE',
  
  // Blockchain
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // General
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// User Groups
export const USER_GROUPS = {
  EMPLOYEES: 'employees',
  RESIDENTS: 'residents', 
  STUDENTS: 'students',
  PUBLIC: 'public',
  TOURISTS: 'tourists',
  VISITORS: 'visitors',
} as const;
