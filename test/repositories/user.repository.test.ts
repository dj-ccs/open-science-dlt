/**
 * User Repository Tests
 */

import '../setup';
import { userRepository } from '../../src/database/repositories/user.repository';
import { ConflictError, NotFoundError } from '../../src/types/errors.types';
import { createTestUser, generateStellarKeypair } from '../helpers/factories';
import { cleanDatabase } from '../setup';

describe('UserRepository', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const { publicKey } = generateStellarKeypair();

      const user = await userRepository.create({
        stellarPublicKey: publicKey,
        displayName: 'Test User',
      });

      expect(user.id).toBeDefined();
      expect(user.stellarPublicKey).toBe(publicKey);
      expect(user.displayName).toBe('Test User');
      expect(user.reputationScore).toBe(0);
      expect(user.isActive).toBe(true);
    });

    it('should throw ConflictError for duplicate Stellar key', async () => {
      const { publicKey } = generateStellarKeypair();

      await userRepository.create({ stellarPublicKey: publicKey });

      await expect(userRepository.create({ stellarPublicKey: publicKey })).rejects.toThrow(
        ConflictError
      );
    });

    it('should throw ConflictError for duplicate email', async () => {
      const email = 'test@example.com';

      await createTestUser({ email });

      const { publicKey } = generateStellarKeypair();
      await expect(
        userRepository.create({
          stellarPublicKey: publicKey,
          email,
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const { user } = await createTestUser();

      const found = await userRepository.findById(user.id);

      expect(found).toBeDefined();
      expect(found!.id).toBe(user.id);
    });

    it('should return null for non-existent ID', async () => {
      const found = await userRepository.findById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('findByStellarKey', () => {
    it('should find user by Stellar public key', async () => {
      const { user } = await createTestUser();

      const found = await userRepository.findByStellarKey(user.stellarPublicKey);

      expect(found).toBeDefined();
      expect(found!.stellarPublicKey).toBe(user.stellarPublicKey);
    });

    it('should return null for non-existent key', async () => {
      const { publicKey } = generateStellarKeypair();
      const found = await userRepository.findByStellarKey(publicKey);

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const email = 'test@example.com';
      await createTestUser({ email });

      const found = await userRepository.findByEmail(email);

      expect(found).toBeDefined();
      expect(found!.email).toBe(email);
    });

    it('should return null for non-existent email', async () => {
      const found = await userRepository.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      const { user } = await createTestUser();

      const updated = await userRepository.update(user.id, {
        displayName: 'Updated Name',
        affiliation: 'New University',
      });

      expect(updated.displayName).toBe('Updated Name');
      expect(updated.affiliation).toBe('New University');
    });

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(
        userRepository.update('non-existent-id', { displayName: 'New Name' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError when updating to duplicate email', async () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';

      const { user: user1 } = await createTestUser({ email: email1 });
      await createTestUser({ email: email2 });

      await expect(userRepository.update(user1.id, { email: email2 })).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe('updateReputation', () => {
    it('should increment reputation score', async () => {
      const { user } = await createTestUser({ reputationScore: 100 });

      const updated = await userRepository.updateReputation(user.id, 50);

      expect(updated.reputationScore).toBe(150);
    });

    it('should decrement reputation score with negative value', async () => {
      const { user } = await createTestUser({ reputationScore: 100 });

      const updated = await userRepository.updateReputation(user.id, -30);

      expect(updated.reputationScore).toBe(70);
    });
  });

  describe('ban and unban', () => {
    it('should ban a user', async () => {
      const { user } = await createTestUser();

      const banned = await userRepository.ban(user.id, 'Terms violation');

      expect(banned.isBanned).toBe(true);
      expect(banned.banReason).toBe('Terms violation');
      expect(banned.isActive).toBe(false);
    });

    it('should unban a user', async () => {
      const { user } = await createTestUser();
      await userRepository.ban(user.id, 'Test ban');

      const unbanned = await userRepository.unban(user.id);

      expect(unbanned.isBanned).toBe(false);
      expect(unbanned.banReason).toBeNull();
      expect(unbanned.isActive).toBe(true);
    });
  });

  describe('delete', () => {
    it('should soft delete a user', async () => {
      const { user } = await createTestUser();

      const deleted = await userRepository.delete(user.id);

      expect(deleted.isActive).toBe(false);
    });
  });

  describe('list', () => {
    it('should list users with pagination', async () => {
      await createTestUser({ displayName: 'User 1' });
      await createTestUser({ displayName: 'User 2' });
      await createTestUser({ displayName: 'User 3' });

      const result = await userRepository.list({ take: 2 });

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(2);
    });

    it('should filter users by where clause', async () => {
      await createTestUser({ displayName: 'Active User', reputationScore: 100 });
      await createTestUser({ displayName: 'Inactive User', reputationScore: 0 });

      const result = await userRepository.list({
        where: { reputationScore: { gte: 50 } },
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].displayName).toBe('Active User');
    });

    it('should sort users', async () => {
      await createTestUser({ displayName: 'Charlie', reputationScore: 30 });
      await createTestUser({ displayName: 'Alice', reputationScore: 100 });
      await createTestUser({ displayName: 'Bob', reputationScore: 50 });

      const result = await userRepository.list({
        orderBy: { reputationScore: 'desc' },
      });

      expect(result.users[0].reputationScore).toBe(100);
      expect(result.users[1].reputationScore).toBe(50);
      expect(result.users[2].reputationScore).toBe(30);
    });
  });
});
