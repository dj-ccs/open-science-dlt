import { z } from 'zod';

// ============================================================================
// STELLAR AUTHENTICATION
// ============================================================================

export const stellarAuthRequestSchema = z.object({
  publicKey: z.string()
    .length(56, 'Stellar public key must be 56 characters')
    .regex(/^G[A-Z2-7]{55}$/, 'Invalid Stellar public key format'),
  challenge: z.string()
    .min(10, 'Challenge too short')
    .max(200, 'Challenge too long'),
  signature: z.string()
    .min(1, 'Signature required')
    .max(500, 'Signature too long'),
});

export const stellarAuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string(),
    stellarPublicKey: z.string(),
    email: z.string().nullable(),
    displayName: z.string().nullable(),
    reputationScore: z.number(),
    orcidId: z.string().nullable(),
  }),
});

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

export const emailAuthRequestSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
});

export const emailAuthResponseSchema = stellarAuthResponseSchema;

// ============================================================================
// USER REGISTRATION
// ============================================================================

export const registerRequestSchema = z.object({
  stellarPublicKey: z.string()
    .length(56)
    .regex(/^G[A-Z2-7]{55}$/),
  email: z.string()
    .email()
    .toLowerCase()
    .optional(),
  password: z.string()
    .min(8)
    .max(100)
    .optional(),
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name too long')
    .optional(),
  affiliation: z.string()
    .max(200)
    .optional(),
  bio: z.string()
    .max(1000)
    .optional(),
});

export const registerResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    stellarPublicKey: z.string(),
    email: z.string().nullable(),
    displayName: z.string().nullable(),
    reputationScore: z.number(),
  }),
});

// ============================================================================
// TOKEN REFRESH
// ============================================================================

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token required'),
});

export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  expiresIn: z.number(),
});

// ============================================================================
// CHALLENGE GENERATION
// ============================================================================

export const generateChallengeResponseSchema = z.object({
  challenge: z.string(),
  expiresAt: z.string().datetime(),
});

// ============================================================================
// CURRENT USER
// ============================================================================

export const currentUserResponseSchema = z.object({
  id: z.string(),
  stellarPublicKey: z.string(),
  email: z.string().nullable(),
  displayName: z.string().nullable(),
  affiliation: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  reputationScore: z.number(),
  orcidId: z.string().nullable(),
  orcidVerified: z.boolean(),
  emailVerified: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

// Type exports for TypeScript
export type StellarAuthRequest = z.infer<typeof stellarAuthRequestSchema>;
export type StellarAuthResponse = z.infer<typeof stellarAuthResponseSchema>;
export type EmailAuthRequest = z.infer<typeof emailAuthRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;
