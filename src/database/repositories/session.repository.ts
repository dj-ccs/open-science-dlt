import { Prisma, Session } from '@prisma/client';
import { prisma } from '../client';
import { NotFoundError, DatabaseError } from '../../types/errors.types';

/**
 * Session Repository
 *
 * Data access layer for Session model operations
 */
export class SessionRepository {
  /**
   * Create a new session
   */
  async create(data: Prisma.SessionCreateInput): Promise<Session> {
    try {
      return await prisma.session.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2003: Foreign key constraint failed
        if (error.code === 'P2003') {
          throw new NotFoundError('User');
        }
        // P2025: Record not found
        if (error.code === 'P2025') {
          throw new NotFoundError('User');
        }
      }
      throw new DatabaseError('Error creating session', error);
    }
  }

  /**
   * Find session by JWT ID (jti)
   */
  async findByJti(jti: string): Promise<Session | null> {
    try {
      return await prisma.session.findUnique({
        where: { jti },
      });
    } catch (error) {
      throw new DatabaseError('Error finding session by JTI', error);
    }
  }

  /**
   * Find session by refresh token
   */
  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    try {
      return await prisma.session.findUnique({
        where: { refreshToken },
      });
    } catch (error) {
      throw new DatabaseError('Error finding session by refresh token', error);
    }
  }

  /**
   * Find all sessions for a user
   */
  async findByUserId(userId: string): Promise<Session[]> {
    try {
      return await prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new DatabaseError('Error finding sessions by user ID', error);
    }
  }

  /**
   * Revoke a session by JTI
   */
  async revoke(jti: string, reason?: string): Promise<Session> {
    try {
      return await prisma.session.update({
        where: { jti },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: reason,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('Session');
        }
      }
      throw new DatabaseError('Error revoking session', error);
    }
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllForUser(userId: string, reason?: string): Promise<number> {
    try {
      const result = await prisma.session.updateMany({
        where: {
          userId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: reason,
        },
      });
      return result.count;
    } catch (error) {
      throw new DatabaseError('Error revoking all user sessions', error);
    }
  }

  /**
   * Delete expired sessions (cleanup task)
   */
  async deleteExpired(): Promise<number> {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      return result.count;
    } catch (error) {
      throw new DatabaseError('Error deleting expired sessions', error);
    }
  }

  /**
   * Check if a session is valid (not revoked, not expired)
   */
  async isValid(jti: string): Promise<boolean> {
    try {
      const session = await this.findByJti(jti);

      if (!session) {
        return false;
      }

      if (session.isRevoked) {
        return false;
      }

      if (session.expiresAt < new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      throw new DatabaseError('Error checking session validity', error);
    }
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(jti: string, newRefreshToken: string): Promise<Session> {
    try {
      return await prisma.session.update({
        where: { jti },
        data: {
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      throw new DatabaseError('Error updating refresh token', error);
    }
  }
}

// Export singleton instance
export const sessionRepository = new SessionRepository();
