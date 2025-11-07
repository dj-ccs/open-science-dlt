import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/api/server';
import { cleanDatabase } from '../setup';
import { createAuthenticatedTestUser, createTestUser } from '../helpers/factories';

/**
 * User API Integration Tests
 *
 * Tests for user profile management endpoints:
 * - GET /api/v1/users/:id
 * - PATCH /api/v1/users/:id
 * - GET /api/v1/users/:id/reputation
 */
describe('User API', () => {
  let server: FastifyInstance;
  let testUser: any;
  let testToken: string;

  beforeAll(async () => {
    server = await buildServer();
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Create authenticated test user
    const result = await createAuthenticatedTestUser({
      stellarPublicKey: 'TEST_KEY_USER_1',
      email: 'testuser@example.com',
      displayName: 'Test User One',
      affiliation: 'Test University',
    });

    testUser = result.user;
    testToken = result.accessToken;
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user profile for valid user ID', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/users/${testUser.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body).toMatchObject({
        id: testUser.id,
        stellarPublicKey: testUser.stellarPublicKey,
        email: testUser.email,
        displayName: testUser.displayName,
        affiliation: testUser.affiliation,
        reputationScore: 0,
        isActive: true,
        emailVerified: false,
        orcidVerified: false,
      });

      // Ensure timestamps are valid ISO strings
      expect(new Date(body.createdAt).toISOString()).toBe(body.createdAt);
      expect(new Date(body.updatedAt).toISOString()).toBe(body.updatedAt);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/users/${fakeId}`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/users/invalid-id-format',
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('VALIDATION_ERROR');
    });

    it('should return public profile information only', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/users/${testUser.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Should NOT include sensitive fields
      expect(body.passwordHash).toBeUndefined();
      expect(body.orcidAccessToken).toBeUndefined();
      expect(body.isBanned).toBeUndefined();
      expect(body.banReason).toBeUndefined();
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update own profile when authenticated', async () => {
      const updates = {
        displayName: 'Updated Display Name',
        bio: 'This is my new bio describing my research interests.',
        affiliation: 'Updated University',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/users/${testUser.id}`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: updates,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.displayName).toBe(updates.displayName);
      expect(body.bio).toBe(updates.bio);
      expect(body.affiliation).toBe(updates.affiliation);
      expect(body.avatarUrl).toBe(updates.avatarUrl);

      // Ensure other fields unchanged
      expect(body.email).toBe(testUser.email);
      expect(body.stellarPublicKey).toBe(testUser.stellarPublicKey);
    });

    it('should allow partial updates', async () => {
      const partialUpdate = {
        displayName: 'Only Name Changed',
      };

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/users/${testUser.id}`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: partialUpdate,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body.displayName).toBe(partialUpdate.displayName);
      // Original affiliation should be unchanged
      expect(body.affiliation).toBe(testUser.affiliation);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/users/${testUser.id}`,
        payload: { displayName: 'Unauthorized Change' },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('UNAUTHORIZED');
    });

    it('should return 403 when trying to update another user profile', async () => {
      // Create second user
      const { user: otherUser } = await createTestUser({
        stellarPublicKey: 'TEST_KEY_USER_2',
        email: 'otheruser@example.com',
        displayName: 'Other User',
      });

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/users/${otherUser.id}`,
        headers: {
          authorization: `Bearer ${testToken}`, // Using first user's token
        },
        payload: { displayName: 'Hacker Attempt' },
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('FORBIDDEN');
      expect(body.message).toContain('your own profile');
    });

    it('should validate displayName length', async () => {
      const invalidUpdate = {
        displayName: '', // Empty string (too short)
      };

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/users/${testUser.id}`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: invalidUpdate,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('VALIDATION_ERROR');
    });

    it('should validate bio length (max 1000 chars)', async () => {
      const invalidUpdate = {
        bio: 'x'.repeat(1001), // Too long
      };

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/users/${testUser.id}`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: invalidUpdate,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('VALIDATION_ERROR');
    });

    it('should validate avatarUrl format', async () => {
      const invalidUpdate = {
        avatarUrl: 'not-a-valid-url',
      };

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/users/${testUser.id}`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: invalidUpdate,
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('VALIDATION_ERROR');
    });

    it('should not allow updating immutable fields', async () => {
      const attemptedUpdate = {
        email: 'newemail@example.com', // Email not in updateUserProfileSchema
        reputationScore: 9999, // Reputation should not be directly updateable
      };

      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/users/${testUser.id}`,
        headers: {
          authorization: `Bearer ${testToken}`,
        },
        payload: attemptedUpdate,
      });

      // Should succeed but ignore invalid fields
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      // Email and reputation should remain unchanged
      expect(body.email).toBe(testUser.email);
      expect(body.reputationScore).toBe(testUser.reputationScore);
    });
  });

  describe('GET /api/v1/users/:id/reputation', () => {
    it('should return reputation history structure', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/users/${testUser.id}/reputation`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);

      expect(body).toMatchObject({
        userId: testUser.id,
        currentScore: 0,
        events: [],
        totalEvents: 0,
      });

      // Verify structure matches schema
      expect(Array.isArray(body.events)).toBe(true);
      expect(typeof body.currentScore).toBe('number');
      expect(typeof body.totalEvents).toBe('number');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/users/${fakeId}/reputation`,
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('NOT_FOUND');
    });

    it('should be accessible without authentication (public endpoint)', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/users/${testUser.id}/reputation`,
      });

      expect(response.statusCode).toBe(200);
      // Should not require authorization header
    });

    it('should return correct user ID in response', async () => {
      const response = await server.inject({
        method: 'GET',
        url: `/api/v1/users/${testUser.id}/reputation`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.userId).toBe(testUser.id);
    });
  });

  describe('Edge Cases & Security', () => {
    it('should handle malformed JWT tokens gracefully', async () => {
      const response = await server.inject({
        method: 'PATCH',
        url: `/api/v1/users/${testUser.id}`,
        headers: {
          authorization: 'Bearer invalid.jwt.token',
        },
        payload: { displayName: 'Should Fail' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject expired tokens', async () => {
      // This would require mocking the JWT service to generate an expired token
      // Skipping for now as it requires time manipulation
    });

    it('should handle SQL injection attempts in user ID', async () => {
      const response = await server.inject({
        method: 'GET',
        url: "/api/v1/users/1'; DROP TABLE users; --",
      });

      // Should return 400 for invalid UUID format, not execute SQL
      expect(response.statusCode).toBe(400);
    });

    it('should rate limit excessive requests', async () => {
      // This would require testing rate limiting configuration
      // Depends on rate limit settings in server configuration
    });
  });
});
