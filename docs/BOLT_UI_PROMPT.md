# Bolt UI/UX Development Prompt

Use this prompt when working with Bolt on the Open Science DLT frontend.

---

## Context for Bolt

You are working on the frontend for **Open Science DLT**, a decentralized scientific publishing platform built on Stellar blockchain. The frontend is already set up with:

- **Framework:** React 18 + TypeScript + Vite 5
- **Styling:** TailwindCSS 3 with custom utility classes
- **State:** Zustand stores for auth and papers
- **API:** Axios client connecting to Fastify backend at `/api/v1/*`
- **Routing:** React Router DOM 6

### Important Architecture Notes

1. **DO NOT** create a separate database or use Supabase. The backend uses PostgreSQL + Prisma.
2. **DO NOT** modify the backend API structure. The API runs on port 3000.
3. **DO** use the existing API client at `src/lib/api.ts`
4. **DO** use the existing Zustand stores at `src/store/`
5. **DO** use the TailwindCSS utility classes defined in `src/index.css`

### Existing File Structure

```
frontend/src/
├── components/
│   ├── Layout.tsx           # Main layout with header/footer
│   └── ProtectedRoute.tsx   # Auth guard
├── pages/
│   ├── HomePage.tsx         # Landing page
│   ├── PapersPage.tsx       # Research listing
│   ├── PaperDetailPage.tsx  # Paper view + discussions
│   ├── LoginPage.tsx        # Email + Stellar auth
│   ├── RegisterPage.tsx     # Account creation
│   ├── ProfilePage.tsx      # User profile
│   └── DashboardPage.tsx    # User dashboard
├── lib/
│   └── api.ts               # API client (Axios)
├── store/
│   ├── auth.ts              # Auth state
│   └── papers.ts            # Papers state
├── types/
│   └── index.ts             # TypeScript types
├── App.tsx
├── main.tsx
└── index.css                # Tailwind + utilities
```

### Available CSS Utility Classes

```css
.btn-primary     /* Blue primary button */
.btn-secondary   /* Gray secondary button */
.btn-outline     /* Outlined button */
.input           /* Form input */
.label           /* Form label */
.card            /* Card container */
.badge-primary   /* Blue badge */
.badge-success   /* Green badge */
.badge-warning   /* Yellow badge */
.badge-error     /* Red badge */
```

---

## UI/UX Tasks for Bolt

### Priority 1: Core Improvements

#### 1. Add Loading Skeletons
Create skeleton loading states for:
- Paper cards on PapersPage
- Paper detail content
- User profile content
- Discussion threads

```tsx
// Example: Create src/components/Skeleton.tsx
export function PaperCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-full mb-1" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  );
}
```

#### 2. Add Toast Notifications
Implement a toast notification system for:
- Success messages (registration, paper submission)
- Error messages (API failures)
- Info messages (session expiration warnings)

Create `src/components/Toast.tsx` and a Zustand store `src/store/toast.ts`.

#### 3. Improve Mobile Responsiveness
Review and improve mobile layouts for:
- Navigation (add mobile menu)
- Paper cards (stack on mobile)
- Forms (full width on mobile)
- Discussion threads

#### 4. Add Error Boundary
Create a global error boundary component to catch React errors gracefully.

### Priority 2: New Features

#### 5. Paper Submission Form
Create `src/pages/SubmitPaperPage.tsx` with:
- Multi-step form wizard
- Title and abstract fields
- Keywords input (tag-style)
- Author management (add multiple Stellar keys)
- File upload placeholder (IPFS integration later)
- Preview before submission

#### 6. Search Improvements
Enhance PapersPage with:
- Debounced search input
- Keyword filter pills
- Sort options (date, relevance)
- Clear filters button

#### 7. Discussion Enhancements
Improve PaperDetailPage discussions:
- Nested replies UI (indentation)
- Reply-to-comment form
- Edit/delete own comments
- Markdown support in comments
- @mention autocomplete

### Priority 3: Polish

#### 8. Dark Mode Support
Add dark mode toggle:
- Update tailwind.config.js for dark mode
- Add toggle in Layout header
- Persist preference in localStorage

#### 9. Accessibility Improvements
- Add ARIA labels to interactive elements
- Ensure proper heading hierarchy
- Add focus indicators
- Test with screen reader

#### 10. Animations
Add subtle animations:
- Page transitions
- Card hover effects
- Button click feedback
- Toast slide-in/out

---

## Example Prompts to Give Bolt

### For Loading Skeletons:
```
Add loading skeleton components to the frontend. Create a new file
src/components/Skeleton.tsx with skeleton variants for: PaperCardSkeleton,
ProfileSkeleton, DiscussionSkeleton. Then update PapersPage.tsx to show
PaperCardSkeleton components while isLoading is true. Use the existing
TailwindCSS classes and the animate-pulse utility.
```

### For Toast Notifications:
```
Implement a toast notification system. Create:
1. src/store/toast.ts - Zustand store with addToast, removeToast actions
2. src/components/Toast.tsx - Toast component with variants (success, error, info)
3. src/components/ToastContainer.tsx - Container that renders all active toasts

Then integrate it into App.tsx and show a success toast when login succeeds
in the auth store.
```

### For Paper Submission:
```
Create a paper submission page at src/pages/SubmitPaperPage.tsx.
Include:
- Form with fields: title, abstract, keywords (as tags)
- Multi-step wizard (1. Basic Info, 2. Authors, 3. Preview)
- Use the existing api.submitPaper() method
- Redirect to the paper detail page on success
- Show validation errors inline

Add a route for this page in App.tsx at /submit (protected route).
```

### For Mobile Navigation:
```
Add a mobile-responsive hamburger menu to the Layout component.
On screens smaller than md breakpoint:
- Hide the desktop nav links
- Show a hamburger button
- Open a slide-out menu on click
- Include all navigation links and auth buttons

Use TailwindCSS responsive classes and add any necessary state.
```

---

## API Endpoints Reference

For Bolt's reference when building features:

### Auth
- `GET /api/v1/auth/challenge` → `{ challenge, expiresAt }`
- `POST /api/v1/auth/stellar` → `{ accessToken, refreshToken, user }`
- `POST /api/v1/auth/login` → `{ accessToken, refreshToken, user }`
- `POST /api/v1/auth/register` → `{ user }`
- `GET /api/v1/auth/me` → `{ user }`

### Users
- `GET /api/v1/users/:id` → `{ user }`
- `PATCH /api/v1/users/:id` → `{ user }`
- `GET /api/v1/users/:id/reputation` → `[{ reputationEvent }]`

### Papers (Backend stubs - may return 404)
- `GET /api/v1/papers` → `{ data: [papers], pagination }`
- `GET /api/v1/papers/:id` → `{ paper }`
- `POST /api/v1/papers` → `{ paper }`

### Discussions (Backend stubs - may return 404)
- `GET /api/v1/papers/:id/discussions` → `[{ discussion }]`
- `POST /api/v1/papers/:id/discussions` → `{ discussion }`

---

## Type Definitions

Available in `src/types/index.ts`:

```typescript
interface User {
  id: string;
  stellarPublicKey: string;
  email?: string;
  displayName?: string;
  reputationScore: number;
  // ...
}

interface Paper {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  status: 'SUBMITTED' | 'IN_REVIEW' | 'PEER_REVIEWED' | 'VERIFIED';
  // ...
}

interface Discussion {
  id: string;
  content: string;
  paperId: string;
  authorId: string;
  parentId?: string;
  replies?: Discussion[];
  // ...
}
```

---

## Reminders for Bolt

1. **Use existing patterns** - Follow the code style in existing components
2. **TypeScript strict mode** - All code must be properly typed
3. **No new databases** - Only use the existing PostgreSQL backend
4. **TailwindCSS only** - No additional CSS libraries
5. **Test locally** - Ensure changes work with `npm run dev`
