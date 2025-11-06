/**
 * Authentication and Authorization Types
 */

/**
 * JWT Payload Structure
 */
export interface JWTPayload {
  sub: string; // User ID
  stellarKey: string; // Stellar public key
  email?: string; // User email (if available)
  orcidId?: string; // ORCID iD (Phase 2B)
  reputation: number; // Reputation score
  iat: number; // Issued at (timestamp)
  exp: number; // Expiration (timestamp)
  jti: string; // JWT ID (for revocation)
}

/**
 * Stellar Authentication Request
 */
export interface StellarAuthRequest {
  publicKey: string;
  challenge: string;
  signature: string;
}

/**
 * Email/Password Authentication Request
 */
export interface EmailAuthRequest {
  email: string;
  password: string;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    stellarPublicKey: string;
    email?: string;
    displayName?: string;
    reputationScore: number;
    orcidId?: string;
  };
}

/**
 * Token Refresh Request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Token Refresh Response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * Fastify Request with authenticated user
 */
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}
