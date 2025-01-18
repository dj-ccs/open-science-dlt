import { OpenSciencePlatform } from '../src/platform/OpenSciencePlatform';
import { ReviewRecommendation, ReviewConfidence } from '../src/contracts/PeerReview';

async function submitReviewExample() {
    // Initialize platform
    const platform = new OpenSciencePlatform({
        network: 'testnet',
        ipfsNode: 'https://ipfs.infura.io:5001'
    });

    // Example review data
    const reviewData = {
        paperHash: 'QmX...', // IPFS hash of the paper being reviewed
        reviewerKey: 'REVIEWER_PUBLIC_KEY',
        content: `
# Paper Review

## Overall Assessment
This paper presents a novel approach to quantum error correction that shows promise.

## Strengths
- Clear methodology
- Well-structured experiments
- Compelling results

## Weaknesses
- Limited discussion of limitations
- Some assumptions need clarification
- Additional validation needed

## Detailed Comments
[Detailed review content...]

## Recommendations
1. Add discussion of limitations
2. Clarify key assumptions
3. Provide additional validation data

## Conclusion
The paper makes a valuable contribution but requires minor revisions.
        `,
        recommendation: ReviewRecommendation.MINOR_REVISION,
        confidence: ReviewConfidence.HIGH,
        conflicts: [] // No conflicts of interest
    };

    try {
        // Submit review
        console.log('Submitting review...');
        const result = await platform.submitReview(reviewData);
        
        console.log('Review submitted successfully!');
        console.log('IPFS Hash:', result.hash);
        console.log('Transaction ID:', result.transaction);

        // Get updated paper status
        const paper = await platform.getPaper(reviewData.paperHash);
        console.log('Updated Paper Status:', paper.status);
        
    } catch (error) {
        console.error('Error submitting review:', error);
    }
}

// Run the example
submitReviewExample().catch(console.error);
