import { Prisma, User } from '@prisma/client';
import { prisma } from '../client';
import { NotFoundError, ConflictError, DatabaseError } from '../../types/errors.types';

/**
 * User Repository
 *
 * Data access layer for User model operations
 */
export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      throw new DatabaseError('Error finding user by ID', error);
    }
  }

  /**
   * Find user by Stellar public key
   */
  async findByStellarKey(stellarPublicKey: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { stellarPublicKey },
      });
    } catch (error) {
      throw new DatabaseError('Error finding user by Stellar key', error);
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      throw new DatabaseError('Error finding user by email', error);
    }
  }

  /**
   * Find user by ORCID iD
   */
  async findByOrcidId(orcidId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { orcidId },
      });
    } catch (error) {
      throw new DatabaseError('Error finding user by ORCID', error);
    }
  }

  /**
   * Create a new user
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await prisma.user.create({
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const field = (error.meta?.target as string[])?.[0] || 'field';
          throw new ConflictError(`User with this ${field} already exists`);
        }
      }
      throw new DatabaseError('Error creating user', error);
    }
  }

  /**
   * Update user by ID
   */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('User');
        }
        if (error.code === 'P2002') {
          const field = (error.meta?.target as string[])?.[0] || 'field';
          throw new ConflictError(`User with this ${field} already exists`);
        }
      }
      throw new DatabaseError('Error updating user', error);
    }
  }

  /**
   * Update user's reputation score
   */
  async updateReputation(userId: string, points: number): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          reputationScore: {
            increment: points,
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Error updating reputation', error);
    }
  }

  /**
   * Get user with reputation history
   */
  async findByIdWithReputation(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          reputationHistory: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Error finding user with reputation history', error);
    }
  }

  /**
   * Get user's papers
   */
  async findByIdWithPapers(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          papers: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Error finding user with papers', error);
    }
  }

  /**
   * Get user's reviews
   */
  async findByIdWithReviews(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          reviews: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Error finding user with reviews', error);
    }
  }

  /**
   * Ban a user
   */
  async ban(id: string, reason: string): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          isBanned: true,
          banReason: reason,
          isActive: false,
        },
      });
    } catch (error) {
      throw new DatabaseError('Error banning user', error);
    }
  }

  /**
   * Unban a user
   */
  async unban(id: string): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          isBanned: false,
          banReason: null,
          isActive: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Error unbanning user', error);
    }
  }

  /**
   * Delete a user (soft delete by deactivating)
   */
  async delete(id: string): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      throw new DatabaseError('Error deleting user', error);
    }
  }

  /**
   * List users with pagination
   */
  async list(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    try {
      const { skip = 0, take = 20, where, orderBy } = params;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take,
          where,
          orderBy,
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        total,
        page: Math.floor(skip / take) + 1,
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      throw new DatabaseError('Error listing users', error);
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
