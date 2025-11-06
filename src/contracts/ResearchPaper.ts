import { Transaction } from 'stellar-sdk';

export interface IResearchPaper {
  hash: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  contentHash: string;
  status: PaperStatus;
  reviews: string[];
  verifications: string[];
  timestamp: number;
}

export enum PaperStatus {
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  PEER_REVIEWED = 'peer_reviewed',
  VERIFIED = 'verified',
}

export class ResearchPaper implements IResearchPaper {
  hash: string;
  title: string;
  abstract: string;
  authors: string[];
  keywords: string[];
  contentHash: string;
  status: PaperStatus;
  reviews: string[];
  verifications: string[];
  timestamp: number;

  constructor(data: Omit<IResearchPaper, 'status' | 'reviews' | 'verifications' | 'timestamp'>) {
    this.hash = data.hash;
    this.title = data.title;
    this.abstract = data.abstract;
    this.authors = data.authors;
    this.keywords = data.keywords;
    this.contentHash = data.contentHash;
    this.status = PaperStatus.SUBMITTED;
    this.reviews = [];
    this.verifications = [];
    this.timestamp = Date.now();
  }

  addReview(reviewHash: string): void {
    this.reviews.push(reviewHash);
    this.updateStatus();
  }

  addVerification(verificationHash: string): void {
    this.verifications.push(verificationHash);
    this.updateStatus();
  }

  private updateStatus(): void {
    if (this.verifications.length >= 2) {
      this.status = PaperStatus.VERIFIED;
    } else if (this.reviews.length >= 3) {
      this.status = PaperStatus.PEER_REVIEWED;
    } else if (this.reviews.length > 0) {
      this.status = PaperStatus.IN_REVIEW;
    }
  }

  toTransaction(): Transaction {
    // Convert paper data to Stellar transaction
    // Implementation will depend on specific Stellar account setup
    throw new Error('Not implemented');
  }

  static fromTransaction(_transaction: Transaction): ResearchPaper {
    // Create paper instance from Stellar transaction
    // Implementation will depend on how data is stored in transaction
    throw new Error('Not implemented');
  }
}
