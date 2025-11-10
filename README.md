# open-science-dlt

A decentralized platform for open science publishing using Stellar blockchain

## 🎯 Project Goals

- Prevent suppression of scientific research
- Make peer review process transparent and auditable
- Enable independent verification of research
- Democratize access to scientific knowledge

### An Implementation Lab of the Unified Conscious Evolution Framework (UCF)

This project is the active **Implementation Laboratory for Pillar I (Science)** of the [Unified Conscious Evolution Framework (UCF)](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework).

- **Our Mission:** To create an immutable, transparent, and decentralized platform for scientific publishing, peer review, and verification.
- **Our North Star:** The [UCF Repository](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework) contains the full architectural vision for a regenerative civilization that this project helps to enable.

## Why This Matters

The history of scientific publishing reveals a concerning pattern of knowledge control and manipulation. In the 1950s, Robert Maxwell's Pergamon Press revolutionized academic publishing by standardizing the peer review process. While this established important quality controls, it also created unprecedented opportunities for controlling scientific information:

- Publishers gained the ability to suppress research by rejecting papers
- Intelligence agencies could monitor cutting-edge research through the review process
- Certain entities could maintain exclusive access to blocked research
- The academic publishing industry became a powerful gatekeeper of knowledge

This centralized control of scientific knowledge continues today through commercial academic publishers, creating:

- Paywalls blocking access to publicly-funded research
- Potential manipulation of the peer review process
- Lack of transparency in research verification
- Limited access to negative results and failed experiments

## Our Solution

OpenScienceDLT uses blockchain technology to create an immutable, transparent platform for scientific publishing that:

- Makes all submitted research permanently available
- Creates an auditable peer review process
- Enables independent verification of results
- Prevents selective suppression of research
- Democratizes access to scientific knowledge

By leveraging Stellar's distributed ledger technology and IPFS for content storage, we create an unstoppable platform for open science that cannot be controlled or manipulated by any single entity.

## Key Features

- **Immutable Research Record**: All submissions are permanently stored and timestamped
- **Transparent Peer Review**: Review process tracked on-chain with verified credentials
- **Independent Verification**: Separate verification contracts track reproduction attempts
- **Public Accessibility**: All research publicly available immediately upon submission

## Get Started

[Installation and usage instructions follow...]

## Join the Revolution

Help us build a future where scientific knowledge is:

- Free from manipulation
- Accessible to all
- Transparently reviewed
- Independently verifiable

Together, we can ensure that scientific knowledge serves humanity rather than special interests.

## 📁 Repository Structure

```
open-science-dlt/
├── .github/workflows/          # CI/CD workflows
├── src/
│   ├── api/                    # HTTP API layer (Fastify)
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Authentication, error handling
│   │   ├── routes/             # API route definitions
│   │   ├── schemas/            # Zod validation schemas
│   │   └── server.ts           # Fastify server setup
│   ├── auth/                   # Authentication services
│   │   ├── jwt.service.ts      # JWT token operations
│   │   ├── stellar.auth.ts     # Stellar signature verification
│   │   ├── password.service.ts # Password hashing (bcrypt)
│   │   └── orcid.service.ts    # ORCID OAuth (Phase 2B)
│   ├── contracts/              # Data models
│   │   ├── ResearchPaper.ts
│   │   ├── PeerReview.ts
│   │   └── Verification.ts
│   ├── database/               # Database layer
│   │   ├── client.ts           # Prisma client
│   │   └── repositories/       # Data access layer
│   ├── platform/               # Core platform
│   │   ├── OpenSciencePlatform.ts
│   │   └── EventEmitter.ts
│   ├── services/               # Business logic
│   │   └── user.service.ts
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utilities
│   │   ├── stellar.ts
│   │   ├── ipfs.ts
│   │   └── logger.ts
│   └── index.ts
├── test/                       # Comprehensive test suite
│   ├── api/                    # API integration tests
│   ├── auth/                   # Authentication tests
│   ├── repositories/           # Repository tests
│   ├── services/               # Service tests
│   └── setup.ts                # Test configuration
├── prisma/
│   └── schema.prisma           # Database schema
├── config/                     # Configuration files
├── docs/                       # Documentation
└── examples/                   # Usage examples
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16+ (v18 or v20 recommended)
- **npm** v7+ (v9+ recommended)
- **PostgreSQL** 15+ (for database)
- **Git**

### 1. Clone and Install

```bash
git clone https://github.com/dj-ccs/open-science-dlt.git
cd open-science-dlt
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb open_science_dlt
createdb open_science_dlt_test  # For tests
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/open_science_dlt?schema=public

# Authentication (Generate secure secrets!)
JWT_SECRET=your-super-secret-jwt-key
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key

# Stellar Blockchain
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=S...  # Your Stellar secret key

# API Configuration
API_HOST=0.0.0.0
API_PORT=3000
```

### 4. Initialize Database

Run Prisma migrations:

```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
```

### 5. Start the API Server

```bash
npm run dev:api  # Development mode with hot reload
```

The API will be available at `http://localhost:3000`

Check health: `http://localhost:3000/health`

### 6. Run Tests

```bash
npm test              # Run all tests with coverage
npm run test:watch    # Watch mode
npm run test:api      # API tests only
```

## 📚 API Documentation

### Authentication Endpoints

The platform provides a complete REST API for authentication and user management:

**Base URL:** `http://localhost:3000/api/v1`

#### Generate Challenge

```bash
GET /auth/challenge
```

Returns a time-limited challenge for Stellar signature authentication.

#### Stellar Authentication

```bash
POST /auth/stellar
Content-Type: application/json

{
  "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "challenge": "open-science-dlt-auth:1699000000000:abc123",
  "signature": "base64-encoded-signature"
}
```

#### Email/Password Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Register New User

```bash
POST /auth/register
Content-Type: application/json

{
  "stellarPublicKey": "GXXXXXXXXX...",
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "displayName": "John Doe"
}
```

#### Get Current User

```bash
GET /auth/me
Authorization: Bearer <access-token>
```

See [docs/API.md](docs/API.md) for complete API documentation.

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev:api        # Start API server (Fastify)
npm run dev            # Start platform (original)

# Database
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio (DB GUI)
npm run db:seed        # Seed database
npm run db:reset       # Reset database

# Building
npm run build          # Build TypeScript
npm run clean          # Clean build artifacts

# Testing
npm test               # Run all tests
npm run test:watch     # Watch mode
npm run test:api       # API tests only

# Code Quality
npm run lint           # Check code style
npm run lint:fix       # Fix code style
npm run format         # Format code
npm run type-check     # TypeScript check

# Documentation
npm run docs           # Generate TypeDoc

# Security
npm run security-audit # Run security checks
```

### Project Structure Deep Dive

**API Layer** (`src/api/`):

- **Routes**: Define endpoints and attach handlers
- **Controllers**: Handle HTTP requests/responses
- **Middleware**: Authentication, error handling, logging
- **Schemas**: Zod validation for request/response

**Authentication** (`src/auth/`):

- **JWT Service**: Token generation and verification
- **Stellar Auth**: Signature-based authentication
- **Password Service**: bcrypt hashing and validation

**Database** (`src/database/`):

- **Repositories**: Data access layer (CRUD operations)
- **Prisma Client**: Type-safe database client

**Services** (`src/services/`):

- Business logic layer
- Orchestrates repositories and external services

### Code Quality Tools

The project uses:

- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Jest**: Testing framework with 75%+ coverage target
- **TypeScript**: Static typing (strict mode)

Install IDE extensions:

- **VS Code**: ESLint, Prettier, Prisma
- **IntelliJ/WebStorm**: Enable ESLint, Prettier plugins

## 💻 Usage Examples

### Using the REST API

**1. Generate Challenge and Authenticate**

```bash
# Step 1: Get challenge
curl http://localhost:3000/api/v1/auth/challenge

# Response:
# {
#   "challenge": "open-science-dlt-auth:1699000000000:abc123...",
#   "expiresAt": "2024-01-01T12:05:00.000Z"
# }

# Step 2: Sign challenge with Stellar key (use your wallet/SDK)
# Then authenticate:
curl -X POST http://localhost:3000/api/v1/auth/stellar \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "GXXXXXXXXX...",
    "challenge": "open-science-dlt-auth:1699000000000:abc123...",
    "signature": "base64-signature..."
  }'

# Response:
# {
#   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "expiresIn": 3600,
#   "user": { "id": "...", "stellarPublicKey": "...", ... }
# }
```

**2. Access Protected Endpoints**

```bash
# Use the access token in Authorization header
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Using the Platform SDK

```typescript
import { OpenSciencePlatform } from 'open-science-dlt';

// Initialize platform
const platform = new OpenSciencePlatform({
  network: 'testnet',
  ipfsNode: 'https://ipfs.infura.io:5001',
  secretKey: process.env.STELLAR_SECRET_KEY,
});

// Submit research paper
const result = await platform.submitPaper({
  title: 'Novel Research Findings',
  abstract: 'This paper presents...',
  authors: ['GXXXXXXXXX...'],
  keywords: ['research', 'science', 'innovation'],
  content: 'Full paper content...',
  timestamp: Date.now(),
});

console.log('Paper submitted:', result.hash);
console.log('Transaction:', result.transaction);
```

### Using with Authentication API

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/v1';

// Register new user
const response = await axios.post(`${API_BASE}/auth/register`, {
  stellarPublicKey: 'GXXXXXXXXX...',
  email: 'researcher@university.edu',
  password: 'SecurePassword123!',
  displayName: 'Dr. Jane Smith',
  affiliation: 'Stanford University',
});

const { accessToken } = response.data;

// Use token for authenticated requests
const profile = await axios.get(`${API_BASE}/auth/me`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## CI/CD Pipeline

Our GitHub Actions workflows handle:

1. **Code Quality**

- Linting
- Type checking
- Style verification
- SonarCloud analysis

2. **Security**

- Vulnerability scanning
- Dependency review
- CodeQL analysis

3. **Documentation**

- API docs generation
- Link checking
- GitHub Pages deployment

4. **Release**

- Automated releases
- Changelog generation
- npm publishing

### Setting Up Required Secrets

Add these secrets in your GitHub repository settings:

```markdown
SONAR_TOKEN # For SonarCloud analysis
SNYK_TOKEN # For Snyk security scanning
NPM_TOKEN # For npm package publishing
```

## 📄 License

This project is licensed under the GNU GPLv3 License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)
- [IPFS](https://github.com/ipfs/js-ipfs)
- [OpenPGP.js](https://github.com/openpgpjs/openpgpjs)

## 🙏 Acknowledgments

This project stands on the shoulders of giants in both the open science and blockchain communities.
