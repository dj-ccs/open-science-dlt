# Open Science DLT - Web Frontend

React + TypeScript + Vite frontend for the Open Science DLT platform.

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** TailwindCSS 3
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Routing:** React Router DOM 6
- **Blockchain:** @stellar/stellar-sdk

## Quick Start

### Prerequisites

- Node.js 18+
- The backend API running on `http://localhost:3000`

### Installation

```bash
# From the frontend directory
npm install

# Copy environment file (optional - defaults work for development)
cp .env.example .env.local
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main app layout with header/footer
│   │   └── ProtectedRoute.tsx
│   ├── pages/               # Route pages
│   │   ├── HomePage.tsx     # Landing page
│   │   ├── PapersPage.tsx   # Research listing
│   │   ├── PaperDetailPage.tsx
│   │   ├── LoginPage.tsx    # Auth (email & Stellar)
│   │   ├── RegisterPage.tsx
│   │   ├── ProfilePage.tsx  # User profile
│   │   └── DashboardPage.tsx
│   ├── lib/
│   │   └── api.ts           # Axios API client
│   ├── store/
│   │   ├── auth.ts          # Auth state (Zustand)
│   │   └── papers.ts        # Papers state
│   ├── types/
│   │   └── index.ts         # TypeScript definitions
│   ├── App.tsx              # Root component with routes
│   ├── main.tsx             # Entry point
│   └── index.css            # TailwindCSS + custom utilities
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Features

### Implemented

- [x] Project setup (Vite + React + TypeScript)
- [x] TailwindCSS with custom design system
- [x] Routing with protected routes
- [x] API client with token management
- [x] Auth store (Zustand) with persistence
- [x] Login page (email + Stellar wallet)
- [x] Registration page with Stellar key generation
- [x] User profile page with reputation history
- [x] Dashboard page
- [x] Papers listing page with filtering
- [x] Paper detail page with discussions

### To Be Implemented (UI/UX Phase)

- [ ] Paper submission form
- [ ] Review submission interface
- [ ] Verification tracking
- [ ] Real-time discussion updates
- [ ] Notifications system
- [ ] Mobile responsive improvements
- [ ] Loading skeletons
- [ ] Error boundary
- [ ] Toast notifications

## API Integration

The frontend connects to the backend API at `/api/v1/*`. In development, Vite proxies these requests to `http://localhost:3000`.

### Available Endpoints

**Auth:**
- `GET /auth/challenge` - Get Stellar auth challenge
- `POST /auth/stellar` - Authenticate with Stellar signature
- `POST /auth/login` - Email/password login
- `POST /auth/register` - Register new user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (revoke session)
- `GET /auth/me` - Get current user

**Users:**
- `GET /users/:id` - Get user profile
- `PATCH /users/:id` - Update profile
- `GET /users/:id/reputation` - Get reputation history

**Papers:** (Backend endpoints need implementation)
- `GET /papers` - List papers
- `GET /papers/:id` - Get paper details
- `POST /papers` - Submit paper

**Discussions:** (Backend endpoints need implementation)
- `GET /papers/:id/discussions` - Get discussions
- `POST /papers/:id/discussions` - Create discussion

## Styling

The project uses TailwindCSS with custom utility classes defined in `src/index.css`:

```css
/* Buttons */
.btn-primary    /* Primary action button */
.btn-secondary  /* Secondary action button */
.btn-outline    /* Outlined button */

/* Form elements */
.input          /* Text input styling */
.label          /* Form label */

/* Cards */
.card           /* Card container */

/* Badges */
.badge-primary  /* Primary badge */
.badge-success  /* Success badge */
.badge-warning  /* Warning badge */
.badge-error    /* Error badge */
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `/api/v1` (proxied) |

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

## Contributing

When working on the frontend:

1. Follow the existing component patterns
2. Use TypeScript strict mode
3. Use Zustand for global state
4. Use TailwindCSS utility classes
5. Keep components small and focused
