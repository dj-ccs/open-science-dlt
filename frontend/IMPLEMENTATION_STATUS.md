# Open Science DLT - Frontend Implementation Status

## Overview

This document outlines the frontend web interface implementation for the Open Science DLT platform. The interface enables users to discover research, manage accounts, submit publications, mint DOIs, and engage in threaded discussions.

## What Has Been Built

### 1. Project Foundation ✅
- **React + Vite + TypeScript** setup with hot module replacement
- **Tailwind CSS** for responsive styling
- **React Router** for client-side routing
- **Zustand** for state management
- **Axios** for API communication
- **Zod** for runtime validation

### 2. Project Structure ✅
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   ├── Header.tsx       # Navigation header
│   │   ├── Footer.tsx       # Footer component
│   │   └── DiscussionThread.tsx  # Comment system
│   ├── pages/              # Route pages
│   │   ├── HomePage.tsx    # Browse research feed
│   │   ├── LoginPage.tsx   # User login
│   │   ├── RegisterPage.tsx # User registration
│   │   ├── ResearchDetailPage.tsx # Paper details
│   │   ├── SubmitResearchPage.tsx # Paper submission
│   │   ├── ProfilePage.tsx # User profiles
│   │   └── DashboardPage.tsx # User dashboard
│   ├── store/
│   │   └── authStore.ts    # Authentication state
│   ├── lib/
│   │   ├── api.ts          # API client configuration
│   │   └── supabase.ts     # Supabase client
│   ├── types/
│   │   └── index.ts        # TypeScript types
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── .env.example            # Environment variables template
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── vite.config.ts          # Vite configuration
```

### 3. Core Features Implemented

#### Authentication System
- Login page with email/password
- Registration page with Stellar public key support
- Protected routes for authenticated users
- JWT token management
- Logout functionality

#### Research Discovery
- Research feed with pagination
- Filter by status (Submitted, In Review, Verified)
- Keyword search
- Status badges
- Research cards with metadata

#### Research Detail View
- Full paper information display
- Author details
- Abstract and keywords
- Review and verification counts
- Blockchain references (IPFS hash, Stellar transaction)
- DOI display (when available)

#### Discussion System (UI Ready)
- Threaded comment interface
- Reply functionality (UI)
- User reputation display
- Like/helpful reactions (UI)
- Real-time updates (pending Supabase integration)

#### User Dashboard
- View submitted papers
- Reputation score tracking
- Account statistics
- Quick access to paper submission

#### Research Submission
- Multi-field form for paper metadata
- Title, abstract, keywords
- Content upload
- Author management
- Form validation

### 4. Responsive Design ✅
- Mobile-first approach
- Tailwind CSS utility classes
- Responsive grid layouts
- Touch-friendly interactions

## What Still Needs to Be Done

### 1. Supabase Integration ⏳

#### Database Schema Creation
Create the following tables in Supabase:

```sql
-- Discussion/Comments table
CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paper_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES discussions(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  likes INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view discussions"
  ON discussions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create discussions"
  ON discussions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own discussions"
  ON discussions FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);
```

#### Real-time Subscriptions
- Set up Supabase Realtime for live comment updates
- Implement optimistic UI updates
- Handle connection state

### 2. DOI Minting Integration ⏳

#### DataCite API Integration
- Create DOI service module
- Implement DOI metadata generation
- Handle DOI minting workflow
- Display minted DOIs on papers
- Add DOI status tracking

Example service structure:
```typescript
// src/services/doi.service.ts
export class DOIService {
  async mintDOI(paperId: string): Promise<string>
  async updateDOIMetadata(doi: string, metadata: any): Promise<void>
  async getDOIStatus(paperId: string): Promise<DOIStatus>
}
```

### 3. Additional Features ⏳

#### User Profile Enhancement
- Editable profile fields
- Avatar upload
- ORCID integration
- Publication history
- Citation metrics

#### Advanced Search
- Full-text search
- Author search with autocomplete
- Date range filtering
- Sort by relevance/date
- Save search filters

#### Notifications System
- Real-time notification feed
- Email digest options
- Mention notifications
- Paper status updates

#### Review System UI
- Review submission form
- Confidence rating
- Recommendation selection
- Blind review mode
- Review history

### 4. Testing & Quality ⏳
- Unit tests for components
- Integration tests for user flows
- E2E tests with Playwright/Cypress
- Accessibility testing
- Performance optimization

### 5. Production Deployment ⏳
- Environment configuration
- Build optimization
- CDN setup
- Error tracking (Sentry)
- Analytics integration

## Environment Variables Required

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Backend API running on port 3000
- Supabase project created

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your actual values

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Workflow

1. **Start Backend API** (in separate terminal):
   ```bash
   cd ..
   npm run dev:api
   ```

2. **Start Frontend Dev Server**:
   ```bash
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Next Steps

### Immediate Priorities

1. **Set up Supabase**
   - Create discussion table schema
   - Configure RLS policies
   - Set up real-time subscriptions
   - Update DiscussionThread component to use real data

2. **Integrate DOI Minting**
   - Set up DataCite credentials
   - Create DOI service
   - Add DOI request UI
   - Implement minting workflow

3. **Connect Backend**
   - Verify API endpoints match frontend expectations
   - Handle authentication flow
   - Test paper submission
   - Implement error handling

4. **Testing**
   - Write unit tests for critical components
   - Create E2E tests for main user journeys
   - Test responsive behavior
   - Verify accessibility

### Long-term Enhancements

- WebSocket integration for real-time features
- Progressive Web App (PWA) support
- Offline mode capability
- Advanced visualization for research networks
- Citation graph visualization
- Collaborative annotation tools
- Export functionality (PDF, BibTeX, etc.)

## Known Issues

1. **TypeScript Configuration**: Some type imports require `type` keyword due to `verbatimModuleSyntax`
2. **Supabase Mock Data**: Discussion system currently uses mock data
3. **File Upload**: Research content submission needs file upload support
4. **Image Optimization**: Need to implement lazy loading for avatars

## Contributing

When adding new features:
1. Follow existing code structure
2. Use TypeScript strict mode
3. Add proper error handling
4. Update this documentation
5. Write tests for new functionality
6. Ensure responsive design

## Architecture Decisions

### Why Vite?
- Fast HMR during development
- Optimized production builds
- Native ESM support
- Better developer experience than CRA

### Why Zustand?
- Lightweight (1KB)
- No boilerplate
- TypeScript-friendly
- No context provider wrapping needed

### Why Tailwind CSS?
- Utility-first approach
- Rapid prototyping
- Consistent design system
- Smaller bundle size than component libraries

### Why React Router?
- Industry standard
- Code-splitting support
- Nested routing
- Strong TypeScript support

## Support

For questions or issues:
- Check existing API documentation in `/docs/API.md`
- Review backend implementation in `/src/api/`
- Consult Supabase documentation for database queries
- See Tailwind CSS docs for styling questions
