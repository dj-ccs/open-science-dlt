// User types
export interface User {
  id: string;
  stellarPublicKey: string;
  email?: string;
  displayName?: string;
  affiliation?: string;
  bio?: string;
  avatarUrl?: string;
  reputationScore: number;
  orcidId?: string;
  orcidVerified?: boolean;
  createdAt: string;
}

// Auth types
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

export interface AuthChallenge {
  challenge: string;
  expiresAt: string;
}

// Paper types
export type PaperStatus = 'SUBMITTED' | 'IN_REVIEW' | 'PEER_REVIEWED' | 'VERIFIED';

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  ipfsHash: string;
  stellarTxHash: string;
  stellarLedger?: number;
  doi?: string;
  status: PaperStatus;
  submitterId: string;
  submitter?: User;
  authorKeys: string[];
  authorOrcids?: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    reviews: number;
    verifications: number;
    discussions: number;
  };
}

// Review types
export type ReviewRecommendation = 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT';
export type ReviewStatus = 'SUBMITTED' | 'VALIDATED' | 'PUBLISHED';

export interface Review {
  id: string;
  paperId: string;
  reviewerId: string;
  reviewer?: User;
  recommendation: ReviewRecommendation;
  confidence: number;
  status: ReviewStatus;
  ipfsHash: string;
  stellarTxHash: string;
  reputationAwarded: number;
  createdAt: string;
}

// Verification types
export type VerificationStatus = 'SUBMITTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface Verification {
  id: string;
  paperId: string;
  verifierId: string;
  verifier?: User;
  reproducible: boolean;
  status: VerificationStatus;
  ipfsHash: string;
  stellarTxHash: string;
  reputationAwarded: number;
  createdAt: string;
}

// Discussion types
export interface Discussion {
  id: string;
  content: string;
  paperId: string;
  authorId: string;
  author?: User;
  parentId?: string;
  replies?: Discussion[];
  likesCount: number;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// Reputation types
export type ReputationEventType =
  | 'PAPER_SUBMITTED'
  | 'PAPER_REVIEWED'
  | 'PAPER_VERIFIED'
  | 'REVIEW_VALIDATED'
  | 'VERIFICATION_SUCCESSFUL'
  | 'GOVERNANCE_PARTICIPATION'
  | 'COMMUNITY_CONTRIBUTION'
  | 'PENALTY_SPAM'
  | 'PENALTY_MISCONDUCT';

export interface ReputationEvent {
  id: string;
  userId: string;
  eventType: ReputationEventType;
  points: number;
  reason: string;
  relatedPaperId?: string;
  relatedReviewId?: string;
  relatedVerificationId?: string;
  createdAt: string;
}

// API response types
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
