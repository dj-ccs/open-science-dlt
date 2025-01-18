import { ResearchPaper, PaperStatus } from '../../src/contracts/ResearchPaper';

describe('ResearchPaper', () => {
    let paper: ResearchPaper;
    
    beforeEach(() => {
        paper = new ResearchPaper({
            hash: 'QmTest...',
            title: 'Test Paper',
            abstract: 'Test abstract',
            authors: ['TEST_KEY_1'],
            keywords: ['test'],
            contentHash: 'QmContent...'
        });
    });

    test('should initialize with correct status', () => {
        expect(paper.status).toBe(PaperStatus.SUBMITTED);
        expect(paper.reviews).toHaveLength(0);
        expect(paper.verifications).toHaveLength(0);
    });

    test('should update status based on reviews', () => {
        paper.addReview('QmReview1...');
        expect(paper.status).toBe(PaperStatus.IN_REVIEW);
        
        paper.addReview('QmReview2...');
        paper.addReview('QmReview3...');
        expect(paper.status).toBe(PaperStatus.PEER_REVIEWED);
    });

    test('should update status based on verifications', () => {
        // Add required reviews first
        paper.addReview('QmReview1...');
        paper.addReview('QmReview2...');
        paper.addReview('QmReview3...');
        
        paper.addVerification('QmVerification1...');
        paper.addVerification('QmVerification2...');
        expect(paper.status).toBe(PaperStatus.VERIFIED);
    });

    test('should maintain review history', () => {
        const reviewHash = 'QmReview...';
        paper.addReview(reviewHash);
        expect(paper.reviews).toContain(reviewHash);
    });

    test('should maintain verification history', () => {
        const verificationHash = 'QmVerification...';
        paper.addVerification(verificationHash);
        expect(paper.verifications).toContain(verificationHash);
    });
});
