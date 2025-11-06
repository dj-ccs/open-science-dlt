/**
 * User Service Tests
 */

import '../setup';
import { userService } from '../../src/services/user.service';
import { UnauthorizedError, ConflictError, ValidationError } from '../../src/types/errors.types';
import { createTestUser, generateStellarKeypair, signChallenge, createTestSession } from '../helpers/factories';
import { StellarAuth } from '../../src/auth/stellar.auth';
import { prisma } from '../setup';

describe('UserService', () => {
  describe('authenticateWithStellar', () => {
    it('should authenticate existing user with valid signature', async () => {
      const { user, stellarKeys } = await createTestUser();
      const challenge = StellarAuth.generateChallenge();
      const signature = signChallenge(challenge, stellarKeys!.keypair);

      const result = await userService.authenticateWithStellar(
        user.stellarPublicKey,
        challenge,
        signature
      );

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe(3600);
      expect(result.user.id).toBe(user.id);
      expect(result.user.stellarPublicKey).toBe(user.stellarPublicKey);
    });

    it('should auto-register new user on first authentication', async () => {
      const { publicKey, keypair } = generateStellarKeypair();
      const challenge = StellarAuth.generateChallenge();
      const signature = signChallenge(challenge, keypair);

      const result = await userService.authenticateWithStellar(
        publicKey,
        challenge,
        signature
      );

      expect(result.accessToken).toBeDefined();
      expect(result.user.stellarPublicKey).toBe(publicKey);

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { stellarPublicKey: publicKey },
      });
      expect(user).toBeDefined();
    });

    it('should throw UnauthorizedError for expired challenge', async () => {
      const { user, stellarKeys } = await createTestUser();
      const oldChallenge = `open-science-dlt-auth:${Date.now() - 10 * 60 * 1000}:abc123`;
      const signature = signChallenge(oldChallenge, stellarKeys!.keypair);

      await expect(
        userService.authenticateWithStellar(user.stellarPublicKey, oldChallenge, signature)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for invalid signature', async () => {
      const { user } = await createTestUser();
      const challenge = StellarAuth.generateChallenge();
      const invalidSignature = 'aW52YWxpZA==';

      await expect(
        userService.authenticateWithStellar(user.stellarPublicKey, challenge, invalidSignature)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for banned user', async () => {
      const { user, stellarKeys } = await createTestUser();
      await prisma.user.update({
        where: { id: user.id },
        data: { isBanned: true },
      });

      const challenge = StellarAuth.generateChallenge();
      const signature = signChallenge(challenge, stellarKeys!.keypair);

      await expect(
        userService.authenticateWithStellar(user.stellarPublicKey, challenge, signature)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should create a session in database', async () => {
      const { user, stellarKeys } = await createTestUser();
      const challenge = StellarAuth.generateChallenge();
      const signature = signChallenge(challenge, stellarKeys!.keypair);

      await userService.authenticateWithStellar(
        user.stellarPublicKey,
        challenge,
        signature
      );

      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      });

      expect(sessions).toHaveLength(1);
      expect(sessions[0].userId).toBe(user.id);
    });
  });

  describe('authenticateWithEmail', () => {
    it('should authenticate user with correct password', async () => {
      const email = 'test@example.com';
      const password = 'SecurePassword123!';
      const { user } = await createTestUser({ email, password });

      const result = await userService.authenticateWithEmail(email, password);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(email);
    });

    it('should throw UnauthorizedError for non-existent email', async () => {
      await expect(
        userService.authenticateWithEmail('nonexistent@example.com', 'password')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for incorrect password', async () => {
      const email = 'test@example.com';
      const password = 'SecurePassword123!';
      await createTestUser({ email, password });

      await expect(
        userService.authenticateWithEmail(email, 'WrongPassword123!')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for user without password', async () => {
      const email = 'test@example.com';
      await createTestUser({ email }); // No password set

      await expect(
        userService.authenticateWithEmail(email, 'anypassword')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for inactive user', async () => {
      const email = 'test@example.com';
      const password = 'SecurePassword123!';
      const { user } = await createTestUser({ email, password });

      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: false },
      });

      await expect(
        userService.authenticateWithEmail(email, password)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const { publicKey } = generateStellarKeypair();
      const userData = {
        stellarPublicKey: publicKey,
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        displayName: 'New User',
        affiliation: 'University',
      };

      const user = await userService.register(userData);

      expect(user.id).toBeDefined();
      expect(user.stellarPublicKey).toBe(publicKey);
      expect(user.email).toBe(userData.email);
      expect(user.displayName).toBe(userData.displayName);
      expect(user.passwordHash).toBeDefined(); // Password was hashed
    });

    it('should register user without email/password', async () => {
      const { publicKey } = generateStellarKeypair();

      const user = await userService.register({
        stellarPublicKey: publicKey,
      });

      expect(user.stellarPublicKey).toBe(publicKey);
      expect(user.email).toBeNull();
      expect(user.passwordHash).toBeNull();
    });

    it('should throw ConflictError for duplicate Stellar key', async () => {
      const { user } = await createTestUser();

      await expect(
        userService.register({
          stellarPublicKey: user.stellarPublicKey,
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ConflictError for duplicate email', async () => {
      const email = 'test@example.com';
      await createTestUser({ email });

      const { publicKey } = generateStellarKeypair();
      await expect(
        userService.register({
          stellarPublicKey: publicKey,
          email,
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should throw ValidationError for weak password', async () => {
      const { publicKey } = generateStellarKeypair();

      await expect(
        userService.register({
          stellarPublicKey: publicKey,
          email: 'test@example.com',
          password: 'weak',
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token with valid refresh token', async () => {
      const { user, stellarKeys } = await createTestUser();
      const challenge = StellarAuth.generateChallenge();
      const signature = signChallenge(challenge, stellarKeys!.keypair);

      const authResult = await userService.authenticateWithStellar(
        user.stellarPublicKey,
        challenge,
        signature
      );

      const result = await userService.refreshAccessToken(authResult.refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.expiresIn).toBe(3600);
    });

    it('should throw UnauthorizedError for invalid refresh token', async () => {
      await expect(
        userService.refreshAccessToken('invalid-token')
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for revoked session', async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user.id, 'jti123');

      await prisma.session.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });

      await expect(
        userService.refreshAccessToken(session.refreshToken!)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('logout', () => {
    it('should revoke session', async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user.id, 'jti123');

      await userService.logout(session.jti);

      const revokedSession = await prisma.session.findUnique({
        where: { jti: session.jti },
      });

      expect(revokedSession!.isRevoked).toBe(true);
      expect(revokedSession!.revokedReason).toBe('User logout');
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      const { user } = await createTestUser({ displayName: 'Test User' });

      const result = await userService.getUserById(user.id);

      expect(result.id).toBe(user.id);
      expect(result.displayName).toBe('Test User');
    });

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(
        userService.getUserById('non-existent-id')
      ).rejects.toThrow();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const { user } = await createTestUser();

      const updated = await userService.updateProfile(user.id, {
        displayName: 'Updated Name',
        affiliation: 'New University',
        bio: 'Updated bio',
      });

      expect(updated.displayName).toBe('Updated Name');
      expect(updated.affiliation).toBe('New University');
      expect(updated.bio).toBe('Updated bio');
    });
  });
});
