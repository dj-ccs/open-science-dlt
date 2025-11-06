/**
 * Authentication API Integration Tests
 */

import '../setup';
import { buildServer } from '../../src/api/server';
import { FastifyInstance } from 'fastify';
import { createTestUser, generateStellarKeypair, signChallenge } from '../helpers/factories';
import { StellarAuth } from '../../src/auth/stellar.auth';
import { prisma } from '../setup';

describe('Authentication API', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /api/v1/auth/challenge', () => {
    it('should generate an authentication challenge', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/auth/challenge',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.challenge).toBeDefined();
      expect(body.challenge).toMatch(/^open-science-dlt-auth:/);
      expect(body.expiresAt).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/stellar', () => {
    it('should authenticate with valid Stellar signature', async () => {
      const { publicKey, keypair } = generateStellarKeypair();
      const challenge = StellarAuth.generateChallenge();
      const signature = signChallenge(challenge, keypair);

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/stellar',
        payload: {
          publicKey,
          challenge,
          signature,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
      expect(body.expiresIn).toBe(3600);
      expect(body.user.stellarPublicKey).toBe(publicKey);
    });

    it('should return 401 for invalid signature', async () => {
      const { publicKey } = generateStellarKeypair();
      const challenge = StellarAuth.generateChallenge();

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/stellar',
        payload: {
          publicKey,
          challenge,
          signature: 'aW52YWxpZA==',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 400 for invalid public key format', async () => {
      const challenge = StellarAuth.generateChallenge();

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/stellar',
        payload: {
          publicKey: 'INVALID_KEY',
          challenge,
          signature: 'c2lnbmF0dXJl',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 401 for expired challenge', async () => {
      const { publicKey, keypair } = generateStellarKeypair();
      const oldChallenge = `open-science-dlt-auth:${Date.now() - 10 * 60 * 1000}:abc123`;
      const signature = signChallenge(oldChallenge, keypair);

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/stellar',
        payload: {
          publicKey,
          challenge: oldChallenge,
          signature,
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const { publicKey } = generateStellarKeypair();

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          stellarPublicKey: publicKey,
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
          displayName: 'New User',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.user.stellarPublicKey).toBe(publicKey);
      expect(body.user.email).toBe('newuser@example.com');
      expect(body.user.displayName).toBe('New User');
    });

    it('should return 400 for weak password', async () => {
      const { publicKey } = generateStellarKeypair();

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          stellarPublicKey: publicKey,
          email: 'test@example.com',
          password: 'weak',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 409 for duplicate Stellar key', async () => {
      const { user } = await createTestUser();

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          stellarPublicKey: user.stellarPublicKey,
        },
      });

      expect(response.statusCode).toBe(409);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with email and password', async () => {
      const email = 'test@example.com';
      const password = 'SecurePassword123!';
      await createTestUser({ email, password });

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email,
          password,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();
      expect(body.user.email).toBe(email);
    });

    it('should return 401 for incorrect password', async () => {
      const email = 'test@example.com';
      const password = 'SecurePassword123!';
      await createTestUser({ email, password });

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email,
          password: 'WrongPassword123!',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for non-existent email', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'password',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token', async () => {
      const { publicKey, keypair } = generateStellarKeypair();
      const challenge = StellarAuth.generateChallenge();
      const signature = signChallenge(challenge, keypair);

      // First authenticate
      const authResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/stellar',
        payload: { publicKey, challenge, signature },
      });

      const { refreshToken } = JSON.parse(authResponse.body);

      // Then refresh
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: { refreshToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.accessToken).toBeDefined();
      expect(body.expiresIn).toBe(3600);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        payload: { refreshToken: 'invalid-token' },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should get current user profile', async () => {
      const { user, stellarKeys } = await createTestUser({ displayName: 'Test User' });
      const challenge = StellarAuth.generateChallenge();
      const signature = signChallenge(challenge, stellarKeys!.keypair);

      // Authenticate
      const authResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/stellar',
        payload: {
          publicKey: user.stellarPublicKey,
          challenge,
          signature,
        },
      });

      const { accessToken } = JSON.parse(authResponse.body);

      // Get profile
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBe(user.id);
      expect(body.displayName).toBe('Test User');
      expect(body.stellarPublicKey).toBe(user.stellarPublicKey);
    });

    it('should return 401 without authentication', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout and revoke session', async () => {
      const { publicKey, keypair } = generateStellarKeypair();
      const challenge = StellarAuth.generateChallenge();
      const signature = signChallenge(challenge, keypair);

      // Authenticate
      const authResponse = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/stellar',
        payload: { publicKey, challenge, signature },
      });

      const { accessToken } = JSON.parse(authResponse.body);

      // Logout
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(response.statusCode).toBe(200);

      // Verify session was revoked
      const meResponse = await server.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      expect(meResponse.statusCode).toBe(401);
    });

    it('should return 401 without authentication', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
