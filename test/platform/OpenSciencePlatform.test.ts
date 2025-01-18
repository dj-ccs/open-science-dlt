import { OpenSciencePlatform } from '../../src/platform/OpenSciencePlatform';
import { ReviewRecommendation, ReviewConfidence } from '../../src/contracts/PeerReview';

// Mock IPFS and Stellar clients
jest.mock('ipfs-http-client');
jest.mock('stellar-sdk');

describe('OpenSciencePlatform', () => {
    let platform: OpenSciencePlatform;
    
    beforeEach(() => {
        platform = new OpenSciencePlatform({
            network: 'testnet',
            ipfsNode: 'https://ipfs.infura.io:5001'
        });
    });

    describe('Paper Submission', () => {
        const mockPaperData = {
            title: 'Test Paper',
            abstract: 'Test abstract',
            authors: ['TEST_KEY_1'],
            keywords: ['test'],
            content: 'Test content'
        };

        test('should successfully submit a paper', async () => {
            const result = await platform.submitPaper(mockPaperData);
            expect(result).toHaveProperty('hash');
            expect(result).toHaveProperty('transaction');
        });

        test('should emit paperSubmitted event', async () => {
            const eventSpy = jest.spyOn(platform, 'emit');
            await platform.submitPaper(mockPaperData);
            expect(eventSpy).toHaveBeenCalledWith('paperSubmitted', expect.any(Object));
        });

        test('should handle submission errors', async () => {
            // Simulate IPFS error
            jest.spyOn(platform['ipfs'], 'uploadContent').mockRejectedValue(new Error());
            await expect(platform.submitPaper(mockPaperData)).rejects.toThrow();
        });
    });

    describe('Review Submission', () => {
        const mockReviewData = {
            paperHash: 'QmTest...',
            reviewerKey: 'TEST_KEY_2',
            content: 'Review content',
            recommendation: ReviewRecommendation.ACCEPT,
            confidence: ReviewConfidence.HIGH,
            conflicts: []
        };

        test('should successfully submit a review', async () => {
            const result = await platform.submitReview(mockReviewData);
            expect(result).toHaveProperty('hash');
            expect(result).toHaveProperty('transaction');
        });

        test('should validate reviewer credentials', async () => {
            jest.spyOn(platform as any, 'validateReviewer').mockResolvedValue(false);
            await expect(platform.submitReview(mockReviewData)).rejects.toThrow();
        });

        test('should emit reviewSubmitted event', async () => {
            const eventSpy = jest.spyOn(platform, 'emit');
            await platform.submitReview(mockReviewData);
            expect(eventSpy).toHaveBeenCalledWith('reviewSubmitted', expect.any(Object));
        });
    });

    describe('Verification Submission', () => {
        const mockVerificationData = {
            paperHash: 'QmTest...',
            verifierKey: 'TEST_KEY_3',
            methodology: 'Test methodology',
            results: 'Test results',
            reproducible: true,
            data: 'Verification data'
        };

        test('should successfully submit verification', async () => {
            const result = await platform.submitVerification(mockVerificationData);
            expect(result).toHaveProperty('hash');
            expect(result).toHaveProperty('transaction');
        });

        test('should validate verifier credentials', async () => {
            jest.spyOn(platform as any, 'validateVerifier').mockResolvedValue(false);
            await expect(platform.submitVerification(mockVerificationData)).rejects.toThrow();
        });

        test('should emit verificationSubmitted event', async () => {
            const eventSpy = jest.spyOn(platform, 'emit');
            await platform.submitVerification(mockVerificationData);
            expect(eventSpy).toHaveBeenCalledWith('verificationSubmitted', expect.any(Object));
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors', async () => {
            jest.spyOn(platform['ipfs'], 'uploadContent').mockRejectedValue(new Error('Network error'));
            await expect(platform.submitPaper({} as any)).rejects.toThrow();
        });

        test('should handle invalid data', async () => {
            await expect(platform.submitPaper({} as any)).rejects.toThrow();
        });

        test('should handle transaction errors', async () => {
            jest.spyOn(platform['stellar'], 'submitTransaction').mockRejectedValue(new Error());
            await expect(platform.submitPaper({} as any)).rejects.toThrow();
        });
    });
});
