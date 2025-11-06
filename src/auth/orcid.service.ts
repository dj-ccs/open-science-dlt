/**
 * ORCID OAuth Service
 *
 * Placeholder for Phase 2B - ORCID Integration
 *
 * This service will handle:
 * - OAuth 2.0 flow with ORCID
 * - Exchange authorization code for access token
 * - Fetch ORCID profile data
 * - Link ORCID iD to user account
 * - Validate ORCID credentials
 */

import { logger } from '../utils/logger';

export interface ORCIDProfile {
  orcidId: string;
  name?: string;
  email?: string;
  affiliation?: string;
  bio?: string;
}

export class ORCIDService {
  /**
   * Generate ORCID OAuth authorization URL
   * (Phase 2B implementation)
   */
  static getAuthorizationUrl(_state: string): string {
    logger.info('ORCID authorization URL requested (not yet implemented)');
    // TODO: Implement in Phase 2B
    return '';
  }

  /**
   * Exchange authorization code for access token
   * (Phase 2B implementation)
   */
  static async getAccessToken(_code: string): Promise<{
    accessToken: string;
    orcidId: string;
  }> {
    logger.info('ORCID access token exchange requested (not yet implemented)');
    // TODO: Implement in Phase 2B
    throw new Error('ORCID integration not yet implemented - Phase 2B');
  }

  /**
   * Fetch ORCID profile data
   * (Phase 2B implementation)
   */
  static async getProfile(_accessToken: string, _orcidId: string): Promise<ORCIDProfile> {
    logger.info('ORCID profile fetch requested (not yet implemented)');
    // TODO: Implement in Phase 2B
    throw new Error('ORCID integration not yet implemented - Phase 2B');
  }

  /**
   * Validate ORCID iD format
   */
  static isValidOrcidId(orcidId: string): boolean {
    // ORCID format: 0000-0002-1825-0097 (16 digits with hyphens)
    const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
    return orcidRegex.test(orcidId);
  }

  /**
   * Format ORCID iD with hyphens
   */
  static formatOrcidId(orcidId: string): string {
    const cleaned = orcidId.replace(/-/g, '');
    if (cleaned.length !== 16) {
      return orcidId;
    }
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
}
