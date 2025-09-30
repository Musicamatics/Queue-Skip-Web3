import { z } from 'zod';

// User Management Types
export const UserRoleSchema = z.enum(['user', 'admin', 'staff', 'super_admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const VenueRoleSchema = z.enum(['user', 'admin', 'staff']);
export type VenueRole = z.infer<typeof VenueRoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  governmentId: z.string().optional(),
  web3Address: z.string().optional(),
  ssoId: z.string().optional(),
  role: UserRoleSchema.default('user'),
  venueId: z.string().optional(),
  userGroup: z.string().optional(),
  venueRole: VenueRoleSchema.optional(),
  createdAt: z.date(),
  lastLoginAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const AuthMethodSchema = z.object({
  type: z.enum(['sso', 'government_id', 'email', 'web3_wallet']),
  provider: z.string().optional(),
  priority: z.number(),
});

export type AuthMethod = z.infer<typeof AuthMethodSchema>;

// Pass Management Types
export const PassStatusSchema = z.enum(['active', 'used', 'expired', 'transferred']);
export type PassStatus = z.infer<typeof PassStatusSchema>;

export const PassRestrictionSchema = z.object({
  type: z.enum(['time_window', 'day_of_week', 'usage_count']),
  value: z.string(),
});

export type PassRestriction = z.infer<typeof PassRestrictionSchema>;

export const PassSchema = z.object({
  id: z.string(),
  userId: z.string(),
  venueId: z.string(),
  type: z.string(), // PassType reference
  status: PassStatusSchema,
  validFrom: z.date(),
  validUntil: z.date(),
  restrictions: z.array(PassRestrictionSchema),
  blockchainTxHash: z.string().optional(),
});

export type Pass = z.infer<typeof PassSchema>;

export const PassTypeSchema = z.object({
  id: z.string(),
  venueId: z.string(),
  name: z.string(),
  description: z.string(),
  restrictions: z.array(PassRestrictionSchema),
  validityPeriod: z.number(), // in hours
  transferable: z.boolean(),
});

export type PassType = z.infer<typeof PassTypeSchema>;

// Venue Configuration Types
export const VenueTypeSchema = z.enum(['transit', 'commercial', 'tourist', 'government']);
export type VenueType = z.infer<typeof VenueTypeSchema>;

export const FeatureFlagsSchema = z.object({
  passTransfer: z.boolean(),
  communityForum: z.boolean(),
  passExpiration: z.boolean(),
  governmentIdRequired: z.boolean(),
  oneTimePasses: z.boolean(),
  surveyRequired: z.boolean(),
  usagePredictions: z.boolean(),
  allowAutoRegistration: z.boolean(),
});

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;

export const VenueConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: VenueTypeSchema,
  authMethods: z.array(AuthMethodSchema),
  passTypes: z.array(PassTypeSchema),
  features: FeatureFlagsSchema,
});

export type VenueConfig = z.infer<typeof VenueConfigSchema>;

export const VenueSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  address: z.string(),
  timezone: z.string(),
  config: VenueConfigSchema,
  createdAt: z.date(),
});

export type Venue = z.infer<typeof VenueSchema>;

// QR Code Types
export const QRCodeSchema = z.object({
  data: z.string(),
  imageUrl: z.string(),
  expiresAt: z.date(),
  signature: z.string(),
  tokenHash: z.string(),
});

export type QRCode = z.infer<typeof QRCodeSchema>;

export const DynamicQRCodeSchema = z.object({
  currentCode: QRCodeSchema,
  refreshUrl: z.string(),
  webDisplayUrl: z.string(),
  refreshInterval: z.number(), // 30 seconds
});

export type DynamicQRCode = z.infer<typeof DynamicQRCodeSchema>;

// Blockchain Types
export const WalletConnectionSchema = z.object({
  address: z.string(),
  chainId: z.string(),
  walletType: z.enum(['phantom', 'solflare', 'metamask', 'other']),
  connected: z.boolean(),
});

export type WalletConnection = z.infer<typeof WalletConnectionSchema>;

// API Response Types
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
  timestamp: z.date(),
  requestId: z.string(),
  retryable: z.boolean(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiResponseSchema = <T>(dataSchema: z.ZodSchema<T>) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: ApiErrorSchema.optional(),
});

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

// Community Types
export const DonationRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  venueId: z.string(),
  reason: z.string(),
  upvotes: z.number(),
  status: z.enum(['open', 'fulfilled', 'closed']),
  createdAt: z.date(),
});

export type DonationRequest = z.infer<typeof DonationRequestSchema>;

// Analytics Types
export const UsagePredictionSchema = z.object({
  venueId: z.string(),
  date: z.date(),
  timeSlot: z.string(),
  expectedPasses: z.number(),
  confidence: z.number(),
});

export type UsagePrediction = z.infer<typeof UsagePredictionSchema>;
