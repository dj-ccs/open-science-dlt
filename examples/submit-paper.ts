import { OpenSciencePlatform } from '../src/platform/OpenSciencePlatform';

async function submitPaperExample() {
  // Initialize the platform
  const platform = new OpenSciencePlatform({
    network: 'testnet',
    ipfsNode: 'https://ipfs.infura.io:5001',
  });

  // Example paper data
  const paperData = {
    title: 'Breakthrough in Quantum Computing',
    abstract: 'This paper presents a novel approach to quantum error correction...',
    authors: ['PUBLIC_KEY_1', 'PUBLIC_KEY_2'],
    keywords: ['quantum computing', 'error correction', 'qubits'],
    content: 'Full paper content would go here...',
  };

  try {
    // Submit the paper
    console.log('Submitting paper...');
    const result = await platform.submitPaper(paperData);

    console.log('Paper submitted successfully!');
    console.log('IPFS Hash:', result.hash);
    console.log('Transaction ID:', result.transaction);

    // Monitor the paper's status
    // TODO: Implement getPaper() method
    // const paper = await platform.getPaper(result.hash);
    // console.log('Paper Status:', paper.status);
  } catch (error) {
    console.error('Error submitting paper:', error);
  }
}

// Run the example
submitPaperExample().catch(console.error);
