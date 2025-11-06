/**
 * Open Science DLT Platform
 *
 * Main entry point for the application
 */

// Load environment variables
import 'dotenv/config';

// Export platform components
export * from './platform/OpenSciencePlatform';
export * from './platform/EventEmitter';

// Export contracts
export * from './contracts/ResearchPaper';
export * from './contracts/PeerReview';
export * from './contracts/Verification';

// Export utilities
export * from './utils/stellar';
export * from './utils/ipfs';
export * from './utils/logger';

// Export API server
export * from './api/server';

// Export types
export * from './types/auth.types';
export * from './types/errors.types';

// Export services
export * from './services/user.service';

// Export repositories
export * from './database/repositories/user.repository';
export * from './database/repositories/session.repository';
export * from './database/repositories/paper.repository';

// Export authentication services
export * from './auth/jwt.service';
export * from './auth/stellar.auth';
export * from './auth/password.service';
export * from './auth/orcid.service';
