# Open Science DLT - Frontend Setup Guide

## Overview

This guide will help you complete the frontend implementation for the Open Science DLT platform. The foundation has been established with React, TypeScript, Vite, Tailwind CSS, and Supabase integration.

## What's Already Done

✅ Project initialized with Vite + React + TypeScript
✅ Tailwind CSS v3 configured with custom utility classes
✅ Supabase database schema created for discussions
✅ Directory structure established
✅ Environment configuration files created
✅ Dependencies installed

## What You Need to Do

### Step 1: Configure Environment Variables

Edit `.env.local` and add your Supabase credentials:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

Get these values from your Supabase project dashboard: https://supabase.com/dashboard

### Step 2: Start Development Servers

**Terminal 1 - Backend API:**
```bash
cd /path/to/project
npm run dev:api
```

**Terminal 2 - Frontend:**
```bash
cd /path/to/project/frontend
npm run dev
```

Access the app at `http://localhost:5173`

### Step 3: Build the Application

```bash
npm run build
```

This will:
1. Type-check TypeScript code
2. Build optimized production bundle
3. Output to `dist/` directory

## File Structure Created

```
frontend/
├── src/
│   ├── components/     # UI components (to be created)
│   ├── pages/          # Route pages (to be created)
│   ├── lib/            # Utilities (to be created)
│   ├── store/          # State management (to be created)
│   ├── types/          # TypeScript types (to be created)
│   └── services/       # Business logic (to be created)
```

## Database Schema

The following table has been created in your Supabase database:

**discussions** table:
- `id` - UUID primary key
- `paper_id` - TEXT, references papers
- `user_id` - TEXT, user who posted
- `content` - TEXT, comment content
- `parent_id` - UUID nullable, for threaded replies
- `likes` - INTEGER, like count
- `created_at` - TIMESTAMPTZ
- `updated_at` - TIMESTAMPTZ

**Row Level Security enabled** with policies for public read, authenticated create/update/delete.

## Next Implementation Steps

### 1. Create Type Definitions

Create `src/types/index.ts`:

```typescript
export interface User {
  id: string;
  stellarPublicKey: string;
  email?: string;
  displayName?: string;
  reputationScore: number;
  createdAt: string;
}

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  keywords: string[];
  ipfsHash: string;
  stellarTxHash: string;
  submitterId: string;
  submitter: User;
  doi?: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'PEER_REVIEWED' | 'VERIFIED';
  createdAt: string;
}

export interface Discussion {
  id: string;
  paperId: string;
  userId: string;
  user: User;
  content: string;
  parentId?: string;
  likes: number;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Create API Client

Create `src/lib/api.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### 4. Create Auth Store

Create `src/store/authStore.ts`:

```typescript
import { create } from 'zustand';
import type { User } from '../types';
import apiClient from '../lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { accessToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null });
  },

  fetchUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      set({ user: response.data });
    } catch {
      set({ user: null });
    }
  },
}));
```

### 5. Create Main App Component

Update `src/App.tsx`:

```typescript
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Import pages (you'll create these)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 6. Create a Simple Home Page

Create `src/pages/HomePage.tsx`:

```typescript
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">OpenScience DLT</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-4">Welcome to Open Science</h2>
        <p className="text-gray-700 mb-6">
          A decentralized platform for transparent scientific publishing.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-2">Immutable</h3>
            <p className="text-gray-600">Research stored on blockchain</p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-2">Transparent</h3>
            <p className="text-gray-600">Public peer review process</p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-2">Verifiable</h3>
            <p className="text-gray-600">Independent verification tracking</p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 7. Test the Build

```bash
npm run build
```

If the build succeeds, you're ready to continue development!

## Supabase Real-time Example

To connect discussions to Supabase with real-time updates:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Discussion } from '../types';

export function useDiscussions(paperId: string) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  useEffect(() => {
    // Fetch initial data
    const fetchDiscussions = async () => {
      const { data } = await supabase
        .from('discussions')
        .select('*')
        .eq('paper_id', paperId)
        .order('created_at', { ascending: false });

      if (data) setDiscussions(data);
    };

    fetchDiscussions();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`discussions:${paperId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussions',
          filter: `paper_id=eq.${paperId}`,
        },
        () => fetchDiscussions()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [paperId]);

  return discussions;
}
```

## Troubleshooting

### Build Errors
- Ensure all dependencies are installed: `npm install`
- Delete `node_modules` and reinstall if needed
- Clear Vite cache: `rm -rf node_modules/.vite`

### Supabase Connection Issues
- Verify your Supabase project is active
- Check that `.env.local` has correct values
- Ensure RLS policies are configured (already done in migration)

### API Connection Issues
- Verify backend is running on port 3000
- Check `VITE_API_URL` environment variable
- Open browser DevTools Network tab to see requests

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vite.dev
- **Zustand**: https://github.com/pmndrs/zustand

## Next Features to Implement

1. **Authentication Pages**: Login, register, password reset
2. **Research Feed**: Browse and search papers
3. **Paper Detail**: View full paper with comments
4. **Discussion System**: Post comments with threading
5. **User Dashboard**: Manage submissions
6. **Paper Submission**: Upload research form
7. **DOI Minting**: Integrate DataCite API
8. **Profile Pages**: User profiles and reputation

## Need Help?

- Check `IMPLEMENTATION_STATUS.md` for detailed status
- Review backend API documentation in `../docs/API.md`
- See Prisma schema in `../prisma/schema.prisma`
- Ask questions in project discussions

Happy coding! 🚀
