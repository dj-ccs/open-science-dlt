import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * User Profile Validation Schemas
 *
 * Zod schemas for user management endpoints with OpenAPI integration
 */

/**
 * GET /users/:id response schema
 * Public user profile information
 */
export const userProfileResponseSchema = z.object({
  id: z.string().uuid(),
  stellarPublicKey: z.string().min(1),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  affiliation: z.string().nullable(),
  bio: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  reputationScore: z.number().int(),
  orcidId: z.string().nullable(),
  orcidVerified: z.boolean(),
  emailVerified: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * PATCH /users/:id request schema
 * Updatable profile fields
 */
export const updateUserProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  affiliation: z.string().min(1).max(200).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional(),
});

/**
 * Reputation event type enum
 * Maps to ReputationEventType in Prisma schema
 */
const reputationEventTypeEnum = z.enum([
  'PAPER_SUBMITTED',
  'PAPER_REVIEWED',
  'PAPER_VERIFIED',
  'REVIEW_VALIDATED',
  'VERIFICATION_SUCCESSFUL',
  'GOVERNANCE_PARTICIPATION',
  'COMMUNITY_CONTRIBUTION',
  'PENALTY_SPAM',
  'PENALTY_MISCONDUCT',
]);

/**
 * Single reputation event schema
 */
export const reputationEventSchema = z.object({
  id: z.string().uuid(),
  eventType: reputationEventTypeEnum,
  points: z.number().int(),
  reason: z.string(),
  createdAt: z.string().datetime(),
  // Related entity IDs (optional - not all events have related entities)
  relatedPaperId: z.string().uuid().nullable(),
  relatedReviewId: z.string().uuid().nullable(),
  relatedVerificationId: z.string().uuid().nullable(),
});

/**
 * GET /users/:id/reputation response schema
 * Complete reputation history for a user
 */
export const reputationHistoryResponseSchema = z.object({
  userId: z.string().uuid(),
  currentScore: z.number().int(),
  events: z.array(reputationEventSchema),
  totalEvents: z.number().int().nonnegative(),
});

/**
 * Path parameter schema for user ID
 */
export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

/**
 * TypeScript types inferred from schemas
 * Use these for type-safe request/response handling
 */
export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type ReputationEvent = z.infer<typeof reputationEventSchema>;
export type ReputationHistoryResponse = z.infer<typeof reputationHistoryResponseSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;

// ============================================================================
// JSON SCHEMA EXPORTS (for Fastify)
// ============================================================================

// Fastify requires JSON Schema format, so we convert Zod schemas
export const userProfileResponseJsonSchema = zodToJsonSchema(userProfileResponseSchema, 'userProfileResponse');
export const updateUserProfileJsonSchema = zodToJsonSchema(updateUserProfileSchema, 'updateUserProfile');
export const reputationEventJsonSchema = zodToJsonSchema(reputationEventSchema, 'reputationEvent');
export const reputationHistoryResponseJsonSchema = zodToJsonSchema(reputationHistoryResponseSchema, 'reputationHistoryResponse');
export const userIdParamJsonSchema = zodToJsonSchema(userIdParamSchema, 'userIdParam');
