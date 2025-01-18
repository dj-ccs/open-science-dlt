import { OpenSciencePlatform } from '../src/platform/OpenSciencePlatform';
import { Verification, VerificationStatus } from '../src/contracts/Verification';

async function verifyResearchExample() {
    // Initialize platform
    const platform = new OpenSciencePlatform({
        network: 'testnet',
        ipfsNode: 'https://ipfs.infura.io:5001'
    });

    // Example verification data
    const verificationData = {
        paperHash: 'QmX...', // IPFS hash of the paper
        verifierKey: 'VERIFIER_PUBLIC_KEY',
        methodology: `
            1. Replicated experimental setup using provided materials
            2. Followed documented procedure
            3. Collected data using specified instruments
            4. Applied statistical analysis methods
            5. Compared results with original findings
        `,
        materials: [
            'QmA...', // IPFS hash of experimental setup
            'QmB...', // IPFS hash of procedure documentation
        ],
        datasetHashes: [
            'QmC...', // IPFS hash of collected data
            'QmD...', // IPFS hash of analysis results
        ]
    };

    try {
        // Submit verification
        console.log('Submitting verification...');
        const result = await platform.submitVerification(verificationData);
        
        console.log('Verification submitted successfully!');
        console.log('IPFS Hash:', result.hash);
        console.log('Transaction ID:', result.transaction);

        // Start verification process
        const verification = await platform.getVerification(result.hash);
        verification.startVerification();
        
        // Simulate verification process
        console.log('Verification in progress...');
        await simulateVerification();
        
        // Complete verification
        verification.complete(
            true, // reproducible
            'Results match original findings within acceptable margins'
        );

        // Update on platform
        await platform.updateVerification(verification);
        
        console.log('Verification Status:', verification.status);
        
    } catch (error) {
        console.error('Error during verification:', error);
    }
}

// Simulate time-consuming verification process
async function simulateVerification(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 2000));
}

// Run the example
verifyResearchExample().catch(console.error);
