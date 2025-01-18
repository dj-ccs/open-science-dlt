# OpenScienceDLT API Documentation

## Core Platform API

### Initialization

```typescript
const platform = new OpenSciencePlatform({
    network: 'testnet' | 'public',
    ipfsNode: string,
    secretKey?: string
});
```

### Paper Management

#### Submit Paper
```typescript
async submitPaper(paper: PaperMetadata & { content: string }): Promise<{ 
    hash: string; 
    transaction: string 
}>
```

#### Get Paper
```typescript
async getPaper(hash: string): Promise<ResearchPaper>
```

#### Update Paper
```typescript
async updatePaper(paper: ResearchPaper): Promise<{ 
    hash: string; 
    transaction: string 
}>
```

### Peer Review

#### Submit Review
```typescript
async submitReview(review: ReviewMetadata & { content: string }): Promise<{
    hash: string;
    transaction: string
}>
```

#### Get Review
```typescript
async getReview(hash: string): Promise<PeerReview>
```

### Verification

#### Submit Verification
```typescript
async submitVerification(verification: VerificationMetadata & { 
    data: string 
}): Promise<{
    hash: string;
    transaction: string
}>
```

#### Get Verification
```typescript
async getVerification(hash: string): Promise<Verification>
```

## Events

### Paper Events
- `paperSubmitted`
- `paperUpdated`
- `paperStatusChanged`

### Review Events
- `reviewSubmitted`
- `reviewValidated`
- `reviewPublished`

### Verification Events
- `verificationSubmitted`
- `verificationStarted`
- `verificationCompleted`

## Error Handling

All API methods may throw the following errors:

- `ValidationError`: Input validation failed
- `NetworkError`: Blockchain or IPFS network error
- `AuthenticationError`: Invalid credentials
- `NotFoundError`: Requested resource not found

## Examples

### Submitting a Paper
```typescript
const result = await platform.submitPaper({
    title: 'Research Title',
    abstract: 'Abstract text...',
    authors: ['PUBLIC_KEY'],
    content: 'Full paper content...'
});
```

### Submitting a Review
```typescript
const result = await platform.submitReview({
    paperHash: 'PAPER_HASH',
    reviewerKey: 'REVIEWER_KEY',
    content: 'Review content...',
    recommendation: ReviewRecommendation.ACCEPT
});
```

## Best Practices

1. Always handle errors appropriately
2. Monitor event emissions for status changes
3. Validate input data before submission
4. Keep private keys secure
5. Use testnet for development

## Rate Limits

- Maximum paper size: 50MB
- Maximum concurrent requests: 10
- Maximum daily submissions: 100
