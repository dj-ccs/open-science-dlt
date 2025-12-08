import { create } from 'zustand';
import { api } from '../lib/api';
import type { Paper, PaginatedResponse } from '../types';

interface PapersState {
  papers: Paper[];
  currentPaper: Paper | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    search?: string;
    keywords?: string[];
  };

  // Actions
  fetchPapers: (page?: number) => Promise<void>;
  fetchPaper: (id: string) => Promise<void>;
  setFilters: (filters: { status?: string; search?: string; keywords?: string[] }) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const usePapersStore = create<PapersState>((set, get) => ({
  papers: [],
  currentPaper: null,
  pagination: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchPapers: async (page = 1) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const response: PaginatedResponse<Paper> = await api.getPapers({
        page,
        limit: 10,
        ...filters,
      });
      set({
        papers: response.data,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch papers';
      set({ error: message, isLoading: false });
    }
  },

  fetchPaper: async (id: string) => {
    set({ isLoading: true, error: null, currentPaper: null });
    try {
      const paper = await api.getPaper(id);
      set({ currentPaper: paper, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch paper';
      set({ error: message, isLoading: false });
    }
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearError: () => set({ error: null }),
}));
