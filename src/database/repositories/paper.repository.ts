import { Prisma, Paper, PaperStatus } from '@prisma/client';
import { prisma } from '../client';
import { NotFoundError, DatabaseError } from '../../types/errors.types';

/**
 * Paper Repository
 *
 * Data access layer for Paper model operations
 */
export class PaperRepository {
  /**
   * Create a new paper
   */
  async create(data: Prisma.PaperCreateInput): Promise<Paper> {
    try {
      return await prisma.paper.create({
        data,
      });
    } catch (error) {
      throw new DatabaseError('Error creating paper', error);
    }
  }

  /**
   * Find paper by ID
   */
  async findById(id: string) {
    try {
      return await prisma.paper.findUnique({
        where: { id },
        include: {
          submitter: {
            select: {
              id: true,
              stellarPublicKey: true,
              displayName: true,
              orcidId: true,
            },
          },
          reviews: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  stellarPublicKey: true,
                  displayName: true,
                },
              },
            },
          },
          verifications: {
            include: {
              verifier: {
                select: {
                  id: true,
                  stellarPublicKey: true,
                  displayName: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Error finding paper by ID', error);
    }
  }

  /**
   * Find paper by IPFS hash
   */
  async findByIpfsHash(ipfsHash: string) {
    try {
      return await prisma.paper.findUnique({
        where: { ipfsHash },
        include: {
          submitter: {
            select: {
              id: true,
              stellarPublicKey: true,
              displayName: true,
              orcidId: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Error finding paper by IPFS hash', error);
    }
  }

  /**
   * Find paper by Stellar transaction hash
   */
  async findByStellarTxHash(stellarTxHash: string) {
    try {
      return await prisma.paper.findUnique({
        where: { stellarTxHash },
        include: {
          submitter: {
            select: {
              id: true,
              stellarPublicKey: true,
              displayName: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Error finding paper by Stellar hash', error);
    }
  }

  /**
   * Find paper by DOI
   */
  async findByDoi(doi: string) {
    try {
      return await prisma.paper.findUnique({
        where: { doi },
        include: {
          submitter: {
            select: {
              id: true,
              stellarPublicKey: true,
              displayName: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Error finding paper by DOI', error);
    }
  }

  /**
   * Update paper
   */
  async update(id: string, data: Prisma.PaperUpdateInput): Promise<Paper> {
    try {
      return await prisma.paper.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundError('Paper');
        }
      }
      throw new DatabaseError('Error updating paper', error);
    }
  }

  /**
   * Update paper status
   */
  async updateStatus(id: string, status: PaperStatus): Promise<Paper> {
    try {
      return await prisma.paper.update({
        where: { id },
        data: { status },
      });
    } catch (error) {
      throw new DatabaseError('Error updating paper status', error);
    }
  }

  /**
   * Add DOI to paper
   */
  async addDoi(id: string, doi: string): Promise<Paper> {
    try {
      return await prisma.paper.update({
        where: { id },
        data: { doi },
      });
    } catch (error) {
      throw new DatabaseError('Error adding DOI to paper', error);
    }
  }

  /**
   * List papers with pagination and filters
   */
  async list(params: {
    skip?: number;
    take?: number;
    status?: PaperStatus;
    keyword?: string;
    author?: string;
    sortBy?: 'createdAt' | 'title' | 'status';
    order?: 'asc' | 'desc';
  }) {
    try {
      const {
        skip = 0,
        take = 20,
        status,
        keyword,
        author,
        sortBy = 'createdAt',
        order = 'desc',
      } = params;

      // Build where clause
      const where: Prisma.PaperWhereInput = {};

      if (status) {
        where.status = status;
      }

      if (keyword) {
        where.OR = [
          { title: { contains: keyword, mode: 'insensitive' } },
          { abstract: { contains: keyword, mode: 'insensitive' } },
          { keywords: { has: keyword } },
        ];
      }

      if (author) {
        where.OR = [
          { submitterId: author },
          { authorKeys: { has: author } },
          { submitter: { stellarPublicKey: author } },
        ];
      }

      // Execute query
      const [papers, total] = await Promise.all([
        prisma.paper.findMany({
          skip,
          take,
          where,
          orderBy: { [sortBy]: order },
          include: {
            submitter: {
              select: {
                id: true,
                stellarPublicKey: true,
                displayName: true,
                orcidId: true,
              },
            },
          },
        }),
        prisma.paper.count({ where }),
      ]);

      return {
        data: papers,
        pagination: {
          page: Math.floor(skip / take) + 1,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      throw new DatabaseError('Error listing papers', error);
    }
  }

  /**
   * Get papers by submitter
   */
  async findBySubmitter(submitterId: string) {
    try {
      return await prisma.paper.findMany({
        where: { submitterId },
        orderBy: { createdAt: 'desc' },
        include: {
          reviews: {
            select: {
              id: true,
              recommendation: true,
              status: true,
            },
          },
          verifications: {
            select: {
              id: true,
              reproducible: true,
              status: true,
            },
          },
        },
      });
    } catch (error) {
      throw new DatabaseError('Error finding papers by submitter', error);
    }
  }

  /**
   * Get review count for a paper
   */
  async getReviewCount(paperId: string): Promise<number> {
    try {
      return await prisma.review.count({
        where: {
          paperId,
          status: 'PUBLISHED',
        },
      });
    } catch (error) {
      throw new DatabaseError('Error getting review count', error);
    }
  }

  /**
   * Get verification count for a paper
   */
  async getVerificationCount(paperId: string): Promise<number> {
    try {
      return await prisma.verification.count({
        where: {
          paperId,
          status: 'COMPLETED',
          reproducible: true,
        },
      });
    } catch (error) {
      throw new DatabaseError('Error getting verification count', error);
    }
  }

  /**
   * Auto-update paper status based on reviews and verifications
   */
  async autoUpdateStatus(paperId: string): Promise<Paper> {
    try {
      const [reviewCount, verificationCount] = await Promise.all([
        this.getReviewCount(paperId),
        this.getVerificationCount(paperId),
      ]);

      let newStatus: PaperStatus = 'SUBMITTED';

      if (verificationCount >= 2) {
        newStatus = 'VERIFIED';
      } else if (reviewCount >= 3) {
        newStatus = 'PEER_REVIEWED';
      } else if (reviewCount >= 1) {
        newStatus = 'IN_REVIEW';
      }

      return await this.updateStatus(paperId, newStatus);
    } catch (error) {
      throw new DatabaseError('Error auto-updating paper status', error);
    }
  }
}

// Export singleton instance
export const paperRepository = new PaperRepository();
