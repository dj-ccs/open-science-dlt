# Phase 2A: Foundation - Technical Specification

**Version:** 1.0
**Date:** 2025-11-05
**Status:** Approved

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack Decisions](#technology-stack-decisions)
3. [Project Structure](#project-structure)
4. [Database Schema Design](#database-schema-design)
5. [API Architecture](#api-architecture)
6. [Authentication System](#authentication-system)
7. [Validation Layer](#validation-layer)
8. [Error Handling Strategy](#error-handling-strategy)
9. [Configuration Management](#configuration-management)
10. [Migration Plan](#migration-plan)
11. [Testing Strategy](#testing-strategy)
12. [Implementation Checklist](#implementation-checklist)

---

## Overview

Phase 2A establishes the foundational infrastructure required for all subsequent features. This includes:

- **HTTP API Layer** using Fastify
- **Database Layer** using PostgreSQL + Prisma
- **Authentication System** using JWT with Stellar public key support
- **Validation Layer** using Zod schemas
- **Error Handling** with structured logging

### Goals

1. Create a production-ready API server that integrates with existing platform code
2. Establish user management and authentication infrastructure
3. Prepare for ORCID integration (Phase 2B)
4. Enable reputation tracking for future governance system
5. Maintain backward compatibility with existing EventEmitter-based platform

### Non-Goals (Deferred to Later Phases)

- ORCID OAuth implementation (Phase 2B)
- DOI minting (Phase 2B)
- Governance implementation (Phase 2B)
- Frontend application

---

## Technology Stack Decisions

### Core Technologies

| Technology     | Version             | Rationale                                                          |
| -------------- | ------------------- | ------------------------------------------------------------------ |
| **Fastify**    | ^4.24.0             | High performance, TypeScript-first, schema-based validation        |
| **Prisma**     | ^5.5.0              | Type-safe ORM, excellent migration tooling, TypeScript integration |
| **PostgreSQL** | 15+                 | JSONB support for flexible metadata, robust ACID compliance        |
| **Zod**        | ^3.22.0             | Runtime type validation, TypeScript inference, composable          |
| **JWT**        | jsonwebtoken ^9.0.2 | Industry standard for stateless authentication                     |
| **bcrypt**     | ^5.1.1              | Password hashing (for optional password auth)                      |

### Development Dependencies

| Technology              | Version | Purpose                          |
| ----------------------- | ------- | -------------------------------- |
| **@fastify/cors**       | ^8.4.0  | CORS middleware                  |
| **@fastify/helmet**     | ^11.1.0 | Security headers                 |
| **@fastify/rate-limit** | ^9.0.0  | Rate limiting                    |
| **@fastify/jwt**        | ^7.2.0  | JWT plugin for Fastify           |
| **@prisma/client**      | ^5.5.0  | Database client (auto-generated) |

---

## Project Structure

### New Directory Layout

```
open-science-dlt/
├── src/
│   ├── api/                        # NEW: HTTP API Layer
│   │   ├── server.ts               # Fastify server setup
│   │   ├── routes/                 # Route handlers
│   │   │   ├── index.ts            # Route registration
│   │   │   ├── auth.routes.ts      # Authentication endpoints
│   │   │   ├── users.routes.ts     # User management
│   │   │   ├── papers.routes.ts    # Paper submission/retrieval
│   │   │   ├── reviews.routes.ts   # Review submission/retrieval
│   │   │   └── verify.routes.ts    # Verification endpoints
│   │   ├── middleware/             # Fastify middleware
│   │   │   ├── authenticate.ts     # JWT verification
│   │   │   ├── authorize.ts        # Role-based access control
│   │   │   ├── errorHandler.ts     # Global error handler
│   │   │   └── requestLogger.ts    # Request logging
│   │   ├── schemas/                # Zod validation schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── user.schema.ts
│   │   │   ├── paper.schema.ts
│   │   │   ├── review.schema.ts
│   │   │   └── common.schema.ts
│   │   └── controllers/            # Business logic handlers
│   │       ├── auth.controller.ts
│   │       ├── user.controller.ts
│   │       ├── paper.controller.ts
│   │       └── review.controller.ts
│   │
│   ├── database/                   # NEW: Database Layer
│   │   ├── schema.prisma           # Prisma schema definition
│   │   ├── client.ts               # Prisma client singleton
│   │   ├── repositories/           # Data access layer
│   │   │   ├── user.repository.ts
│   │   │   ├── session.repository.ts
│   │   │   └── reputation.repository.ts
│   │   └── migrations/             # Prisma migrations (auto-generated)
│   │
│   ├── auth/                       # NEW: Authentication Services
│   │   ├── jwt.service.ts          # JWT token operations
│   │   ├── stellar.auth.ts         # Stellar public key auth
│   │   ├── password.service.ts     # Password hashing/verification
│   │   └── orcid.service.ts        # ORCID OAuth (Phase 2B placeholder)
│   │
│   ├── services/                   # NEW: Business Logic Services
│   │   ├── user.service.ts         # User management
│   │   ├── paper.service.ts        # Paper orchestration
│   │   ├── review.service.ts       # Review orchestration
│   │   └── reputation.service.ts   # Reputation calculation
│   │
│   ├── types/                      # NEW: Shared TypeScript types
│   │   ├── api.types.ts            # API request/response types
│   │   ├── auth.types.ts           # Authentication types
│   │   └── errors.types.ts         # Error types
│   │
│   ├── contracts/                  # EXISTING: Data models
│   │   ├── ResearchPaper.ts
│   │   ├── PeerReview.ts
│   │   └── Verification.ts
│   │
│   ├── platform/                   # EXISTING: Core platform
│   │   ├── OpenSciencePlatform.ts
│   │   └── EventEmitter.ts
│   │
│   ├── utils/                      # EXISTING: Utilities
│   │   ├── stellar.ts
│   │   ├── ipfs.ts
│   │   └── logger.ts               # NEW: Winston logger wrapper
│   │
│   └── index.ts                    # Application entry point (updated)
│
├── prisma/                         # NEW: Prisma directory
│   └── schema.prisma               # Database schema
│
├── test/                           # EXISTING: Tests
│   ├── api/                        # NEW: API tests
│   │   ├── auth.test.ts
│   │   └── papers.test.ts
│   ├── contracts/                  # EXISTING
│   └── platform/                   # EXISTING
│
├── config/                         # EXISTING: Configuration
│   ├── default.json                # Updated with API config
│   ├── development.json            # NEW: Dev overrides
│   ├── production.json             # NEW: Prod overrides
│   └── test.json                   # NEW: Test overrides
│
└── docs/                           # EXISTING: Documentation
    ├── PHASE_2A_FOUNDATION_SPEC.md # This document
    └── API_REFERENCE.md            # NEW: API documentation
```

---

## Database Schema Design

### Prisma Schema

**File:** `prisma/schema.prisma`

```prisma
// This is your Prisma schema file
// Learn more: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

model User {
  id                String    @id @default(cuid())
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Stellar Identity (Primary)
  stellarPublicKey  String    @unique

  // Optional Email/Password Auth
  email             String?   @unique
  passwordHash      String?
  emailVerified     Boolean   @default(false)

  // ORCID Integration (Phase 2B)
  orcidId           String?   @unique
  orcidAccessToken  String?   // Encrypted in production
  orcidVerified     Boolean   @default(false)
  orcidProfile      Json?     // ORCID profile data

  // Profile Information
  displayName       String?
  affiliation       String?
  bio               String?
  avatarUrl         String?

  // Reputation System (for governance)
  reputationScore   Int       @default(0)

  // Status
  isActive          Boolean   @default(true)
  isBanned          Boolean   @default(false)
  banReason         String?

  // Relationships
  sessions          Session[]
  papers            Paper[]
  reviews           Review[]
  verifications     Verification[]
  reputationHistory ReputationEvent[]

  @@index([stellarPublicKey])
  @@index([email])
  @@index([orcidId])
  @@map("users")
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

model Session {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  expiresAt    DateTime

  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // JWT tracking
  jti          String   @unique  // JWT ID for revocation
  refreshToken String?  @unique  // For token refresh

  // Session metadata
  ipAddress    String?
  userAgent    String?

  // Revocation
  isRevoked    Boolean  @default(false)
  revokedAt    DateTime?
  revokedReason String?

  @@index([userId])
  @@index([jti])
  @@index([expiresAt])
  @@map("sessions")
}

// ============================================================================
// RESEARCH PAPERS (Linking to blockchain)
// ============================================================================

model Paper {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Blockchain References
  ipfsHash        String   @unique  // IPFS metadata hash
  stellarTxHash   String   @unique  // Stellar transaction hash
  stellarLedger   Int?              // Ledger sequence number

  // Metadata (duplicated for search/filter)
  title           String
  abstract        String   @db.Text
  keywords        String[]

  // Authors
  submitterId     String
  submitter       User     @relation(fields: [submitterId], references: [id])
  authorKeys      String[] // Stellar public keys of all authors

  // ORCID author tracking (Phase 2B)
  authorOrcids    String[] // ORCID iDs if available

  // DOI (Phase 2B)
  doi             String?  @unique

  // Status tracking
  status          PaperStatus @default(SUBMITTED)

  // Relationships
  reviews         Review[]
  verifications   Verification[]

  // Search optimization
  @@index([ipfsHash])
  @@index([stellarTxHash])
  @@index([submitterId])
  @@index([status])
  @@index([createdAt])
  @@map("papers")
}

enum PaperStatus {
  SUBMITTED
  IN_REVIEW
  PEER_REVIEWED
  VERIFIED
}

// ============================================================================
// PEER REVIEWS (Linking to blockchain)
// ============================================================================

model Review {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Blockchain References
  ipfsHash        String   @unique
  stellarTxHash   String   @unique
  stellarLedger   Int?

  // Paper being reviewed
  paperId         String
  paper           Paper    @relation(fields: [paperId], references: [id])

  // Reviewer
  reviewerId      String
  reviewer        User     @relation(fields: [reviewerId], references: [id])

  // Review data
  recommendation  ReviewRecommendation
  confidence      Int      // 1-5 scale

  // Status
  status          ReviewStatus @default(SUBMITTED)

  // Reputation impact
  reputationAwarded Int    @default(0)

  @@index([paperId])
  @@index([reviewerId])
  @@index([status])
  @@map("reviews")
}

enum ReviewRecommendation {
  ACCEPT
  MINOR_REVISION
  MAJOR_REVISION
  REJECT
}

enum ReviewStatus {
  SUBMITTED
  VALIDATED
  PUBLISHED
}

// ============================================================================
// VERIFICATIONS (Linking to blockchain)
// ============================================================================

model Verification {
  id              String   @id @default(cuid())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Blockchain References
  ipfsHash        String   @unique
  stellarTxHash   String   @unique
  stellarLedger   Int?

  // Paper being verified
  paperId         String
  paper           Paper    @relation(fields: [paperId], references: [id])

  // Verifier
  verifierId      String
  verifier        User     @relation(fields: [verifierId], references: [id])

  // Verification result
  reproducible    Boolean

  // Status
  status          VerificationStatus @default(SUBMITTED)

  // Reputation impact
  reputationAwarded Int    @default(0)

  @@index([paperId])
  @@index([verifierId])
  @@index([status])
  @@map("verifications")
}

enum VerificationStatus {
  SUBMITTED
  IN_PROGRESS
  COMPLETED
  FAILED
}

// ============================================================================
// REPUTATION SYSTEM (For governance)
// ============================================================================

model ReputationEvent {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  eventType   ReputationEventType
  points      Int      // Can be positive or negative
  reason      String

  // Related entities
  relatedPaperId        String?
  relatedReviewId       String?
  relatedVerificationId String?

  @@index([userId])
  @@index([createdAt])
  @@map("reputation_events")
}

enum ReputationEventType {
  PAPER_SUBMITTED
  PAPER_REVIEWED
  PAPER_VERIFIED
  REVIEW_VALIDATED
  VERIFICATION_SUCCESSFUL
  GOVERNANCE_PARTICIPATION
  COMMUNITY_CONTRIBUTION
  PENALTY_SPAM
  PENALTY_MISCONDUCT
}
```

### Database Migration Strategy

1. **Initial Migration**: Create all tables
2. **Seed Data**: Optional test users and sample data
3. **Indexes**: Already defined in schema for performance
4. **Constraints**: UNIQUE constraints on blockchain hashes

### Database Connection Configuration

**Environment Variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/open_science_dlt?schema=public"

# Connection Pooling
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
```

---

## API Architecture

### Fastify Server Setup

**File:** `src/api/server.ts`

```typescript
import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { config } from '../config';
import { logger } from '../utils/logger';
import { registerRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

export async function buildServer() {
  const server = Fastify({
    logger: logger,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
    disableRequestLogging: false,
  });

  // Security plugins
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  });

  await server.register(cors, {
    origin: config.api.corsOrigins,
    credentials: true,
  });

  // Rate limiting
  await server.register(rateLimit, {
    max: config.api.rateLimit.max,
    timeWindow: config.api.rateLimit.window,
    errorResponseBuilder: (request, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${context.after}`,
    }),
  });

  // JWT authentication
  await server.register(jwt, {
    secret: config.auth.jwtSecret,
    sign: {
      expiresIn: config.auth.jwtExpiration,
    },
  });

  // Register routes
  await registerRoutes(server);

  // Global error handler
  server.setErrorHandler(errorHandler);

  // Health check
  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.app.version,
  }));

  return server;
}

export async function startServer() {
  const server = await buildServer();

  try {
    await server.listen({
      port: config.api.port,
      host: config.api.host,
    });

    logger.info(`Server listening on ${config.api.host}:${config.api.port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }

  return server;
}
```

### API Routes Structure

#### Route Registration

**File:** `src/api/routes/index.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { userRoutes } from './users.routes';
import { paperRoutes } from './papers.routes';
import { reviewRoutes } from './reviews.routes';
import { verifyRoutes } from './verify.routes';

export async function registerRoutes(server: FastifyInstance) {
  // API v1 prefix
  await server.register(
    async v1 => {
      // Public routes
      await v1.register(authRoutes, { prefix: '/auth' });
      await v1.register(verifyRoutes, { prefix: '/verify' });

      // Protected routes
      await v1.register(userRoutes, { prefix: '/users' });
      await v1.register(paperRoutes, { prefix: '/papers' });
      await v1.register(reviewRoutes, { prefix: '/reviews' });
    },
    { prefix: '/api/v1' }
  );
}
```

#### Authentication Routes

**File:** `src/api/routes/auth.routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth.controller';
import { stellarAuthSchema, emailAuthSchema, refreshTokenSchema } from '../schemas/auth.schema';

export async function authRoutes(server: FastifyInstance) {
  // Stellar public key authentication
  server.post('/stellar', {
    schema: stellarAuthSchema,
    handler: authController.authenticateWithStellar,
  });

  // Email/password authentication (optional)
  server.post('/login', {
    schema: emailAuthSchema,
    handler: authController.loginWithEmail,
  });

  // Token refresh
  server.post('/refresh', {
    schema: refreshTokenSchema,
    handler: authController.refreshToken,
  });

  // Logout (revoke session)
  server.post('/logout', {
    preHandler: [server.authenticate],
    handler: authController.logout,
  });

  // Get current user
  server.get('/me', {
    preHandler: [server.authenticate],
    handler: authController.getCurrentUser,
  });
}
```

#### Paper Routes

**File:** `src/api/routes/papers.routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { paperController } from '../controllers/paper.controller';
import { authenticate } from '../middleware/authenticate';
import { submitPaperSchema, getPaperSchema, listPapersSchema } from '../schemas/paper.schema';

export async function paperRoutes(server: FastifyInstance) {
  // Submit new paper (protected)
  server.post('/', {
    preHandler: [authenticate],
    schema: submitPaperSchema,
    handler: paperController.submitPaper,
  });

  // Get paper by ID or IPFS hash (public)
  server.get('/:id', {
    schema: getPaperSchema,
    handler: paperController.getPaper,
  });

  // List papers with filters (public)
  server.get('/', {
    schema: listPapersSchema,
    handler: paperController.listPapers,
  });

  // Get paper history from Stellar (public)
  server.get('/:id/history', {
    handler: paperController.getPaperHistory,
  });
}
```

### API Endpoint Specification

| Method             | Endpoint                          | Auth      | Description                         |
| ------------------ | --------------------------------- | --------- | ----------------------------------- |
| **Authentication** |
| POST               | `/api/v1/auth/stellar`            | Public    | Authenticate with Stellar signature |
| POST               | `/api/v1/auth/login`              | Public    | Email/password login                |
| POST               | `/api/v1/auth/refresh`            | Public    | Refresh JWT token                   |
| POST               | `/api/v1/auth/logout`             | Protected | Logout and revoke session           |
| GET                | `/api/v1/auth/me`                 | Protected | Get current user profile            |
| **Users**          |
| GET                | `/api/v1/users/:id`               | Public    | Get user profile                    |
| PATCH              | `/api/v1/users/:id`               | Protected | Update own profile                  |
| GET                | `/api/v1/users/:id/reputation`    | Public    | Get reputation history              |
| **Papers**         |
| POST               | `/api/v1/papers`                  | Protected | Submit new paper                    |
| GET                | `/api/v1/papers`                  | Public    | List papers (with filters)          |
| GET                | `/api/v1/papers/:id`              | Public    | Get paper details                   |
| GET                | `/api/v1/papers/:id/history`      | Public    | Get blockchain history              |
| **Reviews**        |
| POST               | `/api/v1/reviews`                 | Protected | Submit review                       |
| GET                | `/api/v1/reviews/:id`             | Public    | Get review details                  |
| GET                | `/api/v1/papers/:paperId/reviews` | Public    | List reviews for paper              |
| **Verification**   |
| POST               | `/api/v1/verify/hash`             | Public    | Verify file hash against blockchain |
| GET                | `/api/v1/verify/:txHash`          | Public    | Get verification proof              |

---

## Authentication System

### JWT Token Structure

**Access Token Payload:**

```typescript
interface JWTPayload {
  sub: string; // User ID
  stellarKey: string; // Stellar public key
  email?: string; // User email (if available)
  orcidId?: string; // ORCID iD (Phase 2B)
  reputation: number; // Reputation score
  iat: number; // Issued at (timestamp)
  exp: number; // Expiration (timestamp)
  jti: string; // JWT ID (for revocation)
}
```

**Token Lifetimes:**

- **Access Token**: 1 hour
- **Refresh Token**: 30 days

### Stellar Public Key Authentication Flow

```
1. Client generates challenge
   ↓
2. Client signs challenge with Stellar private key
   ↓
3. Client sends: { publicKey, signature, challenge }
   ↓
4. Server verifies signature using Stellar SDK
   ↓
5. Server checks if user exists (or creates new user)
   ↓
6. Server generates JWT access + refresh tokens
   ↓
7. Server creates Session record in database
   ↓
8. Server returns: { accessToken, refreshToken, user }
```

**Implementation:**

**File:** `src/auth/stellar.auth.ts`

```typescript
import { Keypair } from 'stellar-sdk';
import { AppError } from '../types/errors.types';

export class StellarAuth {
  /**
   * Verify Stellar signature
   */
  static verifySignature(publicKey: string, challenge: string, signature: string): boolean {
    try {
      const keypair = Keypair.fromPublicKey(publicKey);
      const challengeBuffer = Buffer.from(challenge, 'utf-8');
      const signatureBuffer = Buffer.from(signature, 'base64');

      return keypair.verify(challengeBuffer, signatureBuffer);
    } catch (error) {
      throw new AppError('Invalid Stellar signature', 401);
    }
  }

  /**
   * Generate authentication challenge
   */
  static generateChallenge(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    return `open-science-dlt-auth:${timestamp}:${random}`;
  }

  /**
   * Validate challenge freshness (5 minute window)
   */
  static isChallengeValid(challenge: string): boolean {
    const parts = challenge.split(':');
    if (parts.length !== 3 || parts[0] !== 'open-science-dlt-auth') {
      return false;
    }

    const timestamp = parseInt(parts[1]);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return now - timestamp < fiveMinutes;
  }
}
```

### JWT Service

**File:** `src/auth/jwt.service.ts`

```typescript
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload } from '../types/auth.types';
import { AppError } from '../types/errors.types';

export class JWTService {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>): string {
    const jti = crypto.randomUUID();

    return jwt.sign({ ...payload, jti }, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiration,
      issuer: 'open-science-dlt',
      audience: 'open-science-dlt-api',
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId, type: 'refresh' }, config.auth.refreshTokenSecret, {
      expiresIn: config.auth.refreshTokenExpiration,
      issuer: 'open-science-dlt',
    });
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.auth.jwtSecret, {
        issuer: 'open-science-dlt',
        audience: 'open-science-dlt-api',
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      }
      throw new AppError('Invalid token', 401);
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): { sub: string } {
    try {
      return jwt.verify(token, config.auth.refreshTokenSecret, {
        issuer: 'open-science-dlt',
      }) as { sub: string };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }
}
```

### Authentication Middleware

**File:** `src/api/middleware/authenticate.ts`

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTService } from '../../auth/jwt.service';
import { sessionRepository } from '../../database/repositories/session.repository';
import { AppError } from '../../types/errors.types';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid Authorization header', 401);
    }

    const token = authHeader.substring(7);

    // Verify token
    const payload = JWTService.verifyAccessToken(token);

    // Check if session is revoked
    const session = await sessionRepository.findByJti(payload.jti);
    if (!session || session.isRevoked) {
      throw new AppError('Session has been revoked', 401);
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      throw new AppError('Session expired', 401);
    }

    // Attach user info to request
    request.user = payload;
  } catch (error) {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({
        error: error.message,
        statusCode: error.statusCode,
      });
    }

    return reply.code(401).send({
      error: 'Unauthorized',
      statusCode: 401,
    });
  }
}
```

---

## Validation Layer

### Zod Schema Design

**File:** `src/api/schemas/auth.schema.ts`

```typescript
import { z } from 'zod';

// ============================================================================
// STELLAR AUTHENTICATION
// ============================================================================

export const stellarAuthRequestSchema = z.object({
  publicKey: z
    .string()
    .length(56)
    .regex(/^G[A-Z2-7]{55}$/, 'Invalid Stellar public key format'),

  challenge: z.string().min(10).max(200),

  signature: z.string().min(1).max(500),
});

export const stellarAuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string(),
    stellarPublicKey: z.string(),
    displayName: z.string().nullable(),
    reputationScore: z.number(),
  }),
});

export const stellarAuthSchema = {
  body: stellarAuthRequestSchema,
  response: {
    200: stellarAuthResponseSchema,
  },
};

// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

export const emailAuthRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const emailAuthSchema = {
  body: emailAuthRequestSchema,
  response: {
    200: stellarAuthResponseSchema,
  },
};

// ============================================================================
// TOKEN REFRESH
// ============================================================================

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export const refreshTokenSchema = {
  body: refreshTokenRequestSchema,
  response: {
    200: z.object({
      accessToken: z.string(),
      expiresIn: z.number(),
    }),
  },
};
```

**File:** `src/api/schemas/paper.schema.ts`

```typescript
import { z } from 'zod';

// ============================================================================
// PAPER SUBMISSION
// ============================================================================

export const submitPaperRequestSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(500, 'Title must not exceed 500 characters'),

  abstract: z
    .string()
    .min(100, 'Abstract must be at least 100 characters')
    .max(5000, 'Abstract must not exceed 5000 characters'),

  keywords: z
    .array(z.string())
    .min(3, 'At least 3 keywords required')
    .max(10, 'Maximum 10 keywords allowed'),

  authors: z
    .array(z.string().regex(/^G[A-Z2-7]{55}$/))
    .min(1, 'At least one author required')
    .max(20, 'Maximum 20 authors allowed'),

  content: z.string().min(1).max(10485760, 'Content must not exceed 10MB'), // 10MB in chars
});

export const submitPaperResponseSchema = z.object({
  id: z.string(),
  ipfsHash: z.string(),
  stellarTxHash: z.string(),
  status: z.enum(['SUBMITTED', 'IN_REVIEW', 'PEER_REVIEWED', 'VERIFIED']),
  createdAt: z.string().datetime(),
});

export const submitPaperSchema = {
  body: submitPaperRequestSchema,
  response: {
    201: submitPaperResponseSchema,
  },
};

// ============================================================================
// GET PAPER
// ============================================================================

export const getPaperParamsSchema = z.object({
  id: z
    .string()
    .cuid()
    .or(z.string().regex(/^Qm[a-zA-Z0-9]{44}$/)), // CUID or IPFS hash
});

export const getPaperResponseSchema = z.object({
  id: z.string(),
  ipfsHash: z.string(),
  stellarTxHash: z.string(),
  stellarLedger: z.number().nullable(),
  title: z.string(),
  abstract: z.string(),
  keywords: z.array(z.string()),
  authorKeys: z.array(z.string()),
  status: z.enum(['SUBMITTED', 'IN_REVIEW', 'PEER_REVIEWED', 'VERIFIED']),
  doi: z.string().nullable(),
  createdAt: z.string().datetime(),
  submitter: z.object({
    id: z.string(),
    displayName: z.string().nullable(),
    stellarPublicKey: z.string(),
  }),
});

export const getPaperSchema = {
  params: getPaperParamsSchema,
  response: {
    200: getPaperResponseSchema,
  },
};

// ============================================================================
// LIST PAPERS
// ============================================================================

export const listPapersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['SUBMITTED', 'IN_REVIEW', 'PEER_REVIEWED', 'VERIFIED']).optional(),
  keyword: z.string().optional(),
  author: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'status']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const listPapersResponseSchema = z.object({
  data: z.array(getPaperResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const listPapersSchema = {
  querystring: listPapersQuerySchema,
  response: {
    200: listPapersResponseSchema,
  },
};
```

### Validation Middleware Integration

Fastify automatically validates requests based on the schema. If validation fails, it returns a 400 error with details.

**Example Error Response:**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "body/title must NOT have fewer than 10 characters"
}
```

---

## Error Handling Strategy

### Error Types

**File:** `src/types/errors.types.ts`

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class BlockchainError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'BLOCKCHAIN_ERROR', details);
    this.name = 'BlockchainError';
  }
}

export class IPFSError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'IPFS_ERROR', details);
    this.name = 'IPFSError';
  }
}
```

### Global Error Handler

**File:** `src/api/middleware/errorHandler.ts`

```typescript
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../../utils/logger';
import { AppError } from '../../types/errors.types';

export async function errorHandler(
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error
  logger.error({
    err: error,
    req: {
      method: request.method,
      url: request.url,
      headers: request.headers,
    },
  });

  // Handle custom AppError
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }

  // Handle Fastify validation errors
  if (error.validation) {
    return reply.code(400).send({
      statusCode: 400,
      error: 'Validation Error',
      message: error.message,
      validation: error.validation,
    });
  }

  // Handle other errors
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : error.message;

  return reply.code(statusCode).send({
    statusCode,
    error: error.name || 'Error',
    message,
  });
}
```

---

## Configuration Management

### Configuration Structure

**File:** `config/default.json`

```json
{
  "app": {
    "name": "Open Science DLT",
    "version": "0.2.0",
    "environment": "development"
  },
  "api": {
    "host": "0.0.0.0",
    "port": 3000,
    "corsOrigins": ["http://localhost:3000", "http://localhost:5173"],
    "rateLimit": {
      "max": 100,
      "window": "15m"
    }
  },
  "auth": {
    "jwtSecret": "CHANGE_THIS_IN_PRODUCTION",
    "jwtExpiration": "1h",
    "refreshTokenSecret": "CHANGE_THIS_IN_PRODUCTION",
    "refreshTokenExpiration": "30d",
    "stellarChallengeWindow": "5m"
  },
  "database": {
    "url": "${DATABASE_URL}",
    "pool": {
      "min": 2,
      "max": 10
    }
  },
  "network": {
    "stellar": {
      "network": "testnet",
      "horizon": "https://horizon-testnet.stellar.org",
      "baseFee": 100
    },
    "ipfs": {
      "node": "https://ipfs.infura.io:5001",
      "gateway": "https://ipfs.io/ipfs",
      "timeout": 30000
    }
  },
  "platform": {
    "minReviewers": 3,
    "minVerifications": 2,
    "reviewTimeout": 604800,
    "verificationTimeout": 1209600,
    "maxContentSize": 52428800
  },
  "reputation": {
    "paperSubmission": 10,
    "reviewSubmission": 20,
    "verificationSuccess": 30,
    "reviewValidated": 15
  }
}
```

**File:** `config/production.json`

```json
{
  "app": {
    "environment": "production"
  },
  "api": {
    "corsOrigins": ["https://openscience.app"],
    "rateLimit": {
      "max": 50,
      "window": "15m"
    }
  },
  "network": {
    "stellar": {
      "network": "public",
      "horizon": "https://horizon.stellar.org"
    }
  }
}
```

### Environment Variables

Create `.env` file:

```env
# Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/open_science_dlt?schema=public

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this

# Stellar
STELLAR_SECRET_KEY=SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# IPFS (Infura)
IPFS_PROJECT_ID=your-infura-project-id
IPFS_PROJECT_SECRET=your-infura-project-secret

# Optional: Future integrations
ORCID_CLIENT_ID=
ORCID_CLIENT_SECRET=
DATACITE_USERNAME=
DATACITE_PASSWORD=
```

---

## Migration Plan

### Migration from Current Platform to API

The existing `OpenSciencePlatform` class will be wrapped by API controllers, maintaining backward compatibility.

**Integration Pattern:**

```typescript
// src/api/controllers/paper.controller.ts
import { OpenSciencePlatform } from '../../platform/OpenSciencePlatform';
import { paperService } from '../../services/paper.service';

export const paperController = {
  async submitPaper(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user; // From JWT
    const body = request.body as SubmitPaperRequest;

    // Use existing platform for blockchain operations
    const platform = new OpenSciencePlatform({
      network: config.network.stellar.network,
      ipfsNode: config.network.ipfs.node,
      secretKey: config.stellar.secretKey,
    });

    // Submit to blockchain
    const { hash, transaction } = await platform.submitPaper({
      ...body,
      timestamp: Date.now(),
    });

    // Save to database
    const paper = await paperService.create({
      ipfsHash: hash,
      stellarTxHash: transaction,
      submitterId: user.sub,
      ...body,
    });

    return reply.code(201).send(paper);
  },
};
```

### Data Synchronization

**Challenge:** Existing blockchain data needs to be indexed in the database.

**Solution:** Migration script to:

1. Query Stellar for all historical transactions
2. Parse transaction data
3. Create database records for existing papers/reviews
4. Link to appropriate users (if identifiable)

**File:** `scripts/sync-blockchain-data.ts`

```typescript
// Script to sync historical blockchain data to database
// Run once during migration
```

---

## Testing Strategy

### Unit Tests

**Test Coverage Goals:**

- Controllers: 90%+
- Services: 90%+
- Repositories: 85%+
- Middleware: 95%+
- Utils: 90%+

**Example Test:**

**File:** `test/api/auth.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { buildServer } from '../../src/api/server';
import { FastifyInstance } from 'fastify';

describe('Authentication API', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /api/v1/auth/stellar', () => {
    it('should authenticate with valid Stellar signature', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/stellar',
        payload: {
          publicKey: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          challenge: 'open-science-dlt-auth:1699000000000:abcdef',
          signature: 'validSignatureBase64',
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('accessToken');
      expect(response.json()).toHaveProperty('refreshToken');
    });

    it('should reject invalid signature', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/stellar',
        payload: {
          publicKey: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          challenge: 'open-science-dlt-auth:1699000000000:abcdef',
          signature: 'invalidSignature',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
```

### Integration Tests

Test full API flows:

1. User authentication → Paper submission → Database persistence → Blockchain verification
2. Review submission → Reputation update → Status change

### Database Testing

Use separate test database with automated cleanup:

```typescript
// test/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeEach(async () => {
  // Clean database before each test
  await prisma.$transaction([
    prisma.reputationEvent.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.review.deleteMany(),
    prisma.paper.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});
```

---

## Implementation Checklist

### Phase 2A.1: Database Setup (Week 1, Days 1-2)

- [ ] Install Prisma and PostgreSQL dependencies
- [ ] Create `prisma/schema.prisma` with all models
- [ ] Set up database connection configuration
- [ ] Run initial migration: `npx prisma migrate dev --name init`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Create database client singleton (`src/database/client.ts`)
- [ ] Create repository layer (User, Session, Paper, Review, Verification)
- [ ] Write repository unit tests

### Phase 2A.2: Authentication System (Week 1, Days 3-5)

- [ ] Implement Stellar authentication service (`src/auth/stellar.auth.ts`)
- [ ] Implement JWT service (`src/auth/jwt.service.ts`)
- [ ] Implement password service (`src/auth/password.service.ts`)
- [ ] Create authentication middleware (`src/api/middleware/authenticate.ts`)
- [ ] Create Zod auth schemas (`src/api/schemas/auth.schema.ts`)
- [ ] Write authentication unit tests
- [ ] Write authentication integration tests

### Phase 2A.3: Fastify Server Setup (Week 2, Days 1-2)

- [ ] Install Fastify and plugins
- [ ] Create server configuration (`src/api/server.ts`)
- [ ] Set up CORS, Helmet, Rate Limiting
- [ ] Integrate Winston logger
- [ ] Create global error handler
- [ ] Create route registration system
- [ ] Add health check endpoint
- [ ] Write server startup tests

### Phase 2A.4: API Routes Implementation (Week 2, Days 3-5)

- [ ] Implement authentication routes (`src/api/routes/auth.routes.ts`)
- [ ] Implement user routes (`src/api/routes/users.routes.ts`)
- [ ] Implement paper routes (`src/api/routes/papers.routes.ts`)
- [ ] Implement review routes (`src/api/routes/reviews.routes.ts`)
- [ ] Implement verification routes (`src/api/routes/verify.routes.ts`)
- [ ] Create all Zod schemas for validation
- [ ] Write route integration tests

### Phase 2A.5: Controllers & Services (Week 2, Days 3-5, overlap with routes)

- [ ] Implement auth controller
- [ ] Implement user controller
- [ ] Implement paper controller
- [ ] Implement review controller
- [ ] Implement user service
- [ ] Implement paper service (wraps OpenSciencePlatform)
- [ ] Implement review service
- [ ] Implement reputation service
- [ ] Write service unit tests

### Phase 2A.6: Configuration & Documentation (Week 2, Day 5)

- [ ] Update `config/default.json` with API settings
- [ ] Create `config/production.json`
- [ ] Create `.env.example` file
- [ ] Update `package.json` with new scripts
- [ ] Generate API documentation (OpenAPI/Swagger)
- [ ] Update README.md with API setup instructions
- [ ] Create API usage examples

### Phase 2A.7: Testing & Quality Assurance (End of Week 2)

- [ ] Run full test suite
- [ ] Verify 80%+ code coverage
- [ ] Run ESLint and fix issues
- [ ] Run Prettier and format code
- [ ] Security audit: `npm audit`
- [ ] Manual API testing with Postman/Insomnia
- [ ] Performance testing (load testing with autocannon)

### Phase 2A.8: Deployment Preparation (Optional, Week 2)

- [ ] Create Docker configuration
- [ ] Create database migration scripts for production
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Configure environment-based deployments
- [ ] Set up monitoring (optional: Sentry, LogRocket)

---

## Success Criteria

Phase 2A will be considered complete when:

1. ✅ All database models are defined and migrated
2. ✅ Stellar public key authentication is working end-to-end
3. ✅ JWT token generation and verification is implemented
4. ✅ All core API endpoints are implemented and tested
5. ✅ Paper submission flows through API → Database → Blockchain
6. ✅ Test coverage is ≥80% for all new code
7. ✅ API documentation is generated and accurate
8. ✅ Server can be started with `npm run dev` and is accessible
9. ✅ All ESLint and Prettier checks pass
10. ✅ No critical security vulnerabilities in dependencies

---

## Next Steps After Phase 2A

Once the foundation is complete, we will proceed to:

1. **Phase 2B.1**: Immutable Hash-Stamp Enhancement
2. **Phase 2B.2**: ORCID Integration
3. **Phase 2B.3**: FAIR Metadata Implementation
4. **Phase 2B.4**: DOI Minting Integration
5. **Phase 2B.5**: Versioned Preregistrations
6. **Phase 2B.6**: Governance Framework Specification

---

## Appendix A: Dependencies to Install

```bash
# Core API dependencies
npm install fastify@^4.24.0
npm install @fastify/cors@^8.4.0
npm install @fastify/helmet@^11.1.0
npm install @fastify/rate-limit@^9.0.0
npm install @fastify/jwt@^7.2.0

# Database
npm install prisma@^5.5.0 --save-dev
npm install @prisma/client@^5.5.0

# Validation
npm install zod@^3.22.0

# Authentication
npm install jsonwebtoken@^9.0.2
npm install bcrypt@^5.1.1
npm install @types/jsonwebtoken@^9.0.4 --save-dev
npm install @types/bcrypt@^5.0.1 --save-dev

# Utilities
npm install dotenv@^16.3.1
```

---

## Appendix B: File Creation Checklist

**New Files to Create (Total: ~35 files)**

```
✓ docs/PHASE_2A_FOUNDATION_SPEC.md (this file)
□ prisma/schema.prisma
□ src/api/server.ts
□ src/api/routes/index.ts
□ src/api/routes/auth.routes.ts
□ src/api/routes/users.routes.ts
□ src/api/routes/papers.routes.ts
□ src/api/routes/reviews.routes.ts
□ src/api/routes/verify.routes.ts
□ src/api/middleware/authenticate.ts
□ src/api/middleware/authorize.ts
□ src/api/middleware/errorHandler.ts
□ src/api/schemas/auth.schema.ts
□ src/api/schemas/user.schema.ts
□ src/api/schemas/paper.schema.ts
□ src/api/schemas/review.schema.ts
□ src/api/schemas/common.schema.ts
□ src/api/controllers/auth.controller.ts
□ src/api/controllers/user.controller.ts
□ src/api/controllers/paper.controller.ts
□ src/api/controllers/review.controller.ts
□ src/database/client.ts
□ src/database/repositories/user.repository.ts
□ src/database/repositories/session.repository.ts
□ src/database/repositories/paper.repository.ts
□ src/auth/jwt.service.ts
□ src/auth/stellar.auth.ts
□ src/auth/password.service.ts
□ src/services/user.service.ts
□ src/services/paper.service.ts
□ src/services/review.service.ts
□ src/services/reputation.service.ts
□ src/types/api.types.ts
□ src/types/auth.types.ts
□ src/types/errors.types.ts
□ src/utils/logger.ts
□ config/production.json
□ config/test.json
□ test/api/auth.test.ts
□ test/api/papers.test.ts
□ .env.example
```

---

**End of Phase 2A Foundation Specification**
