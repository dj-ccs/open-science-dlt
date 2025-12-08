import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  AuthResponse,
  AuthChallenge,
  User,
  Paper,
  Discussion,
  ReputationEvent,
  PaginatedResponse,
  ApiError,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && this.refreshToken && originalRequest) {
          try {
            const response = await this.refreshAccessToken();
            this.setTokens(response.accessToken, response.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return this.client(originalRequest);
          } catch {
            this.clearTokens();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );

    // Load tokens from localStorage on init
    this.loadTokens();
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // ============================================================================
  // AUTH ENDPOINTS
  // ============================================================================

  async getChallenge(): Promise<AuthChallenge> {
    const response = await this.client.get<AuthChallenge>('/auth/challenge');
    return response.data;
  }

  async authenticateWithStellar(
    publicKey: string,
    challenge: string,
    signature: string
  ): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/stellar', {
      publicKey,
      challenge,
      signature,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async register(data: {
    stellarPublicKey: string;
    email?: string;
    password?: string;
    displayName?: string;
    affiliation?: string;
    bio?: string;
  }): Promise<User> {
    const response = await this.client.post<User>('/auth/register', data);
    return response.data;
  }

  async refreshAccessToken(): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/refresh', {
      refreshToken: this.refreshToken,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.clearTokens();
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  // ============================================================================
  // USER ENDPOINTS
  // ============================================================================

  async getUser(id: string): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`);
    return response.data;
  }

  async updateProfile(
    id: string,
    data: {
      displayName?: string;
      affiliation?: string;
      bio?: string;
      avatarUrl?: string;
    }
  ): Promise<User> {
    const response = await this.client.patch<User>(`/users/${id}`, data);
    return response.data;
  }

  async getUserReputation(id: string): Promise<ReputationEvent[]> {
    const response = await this.client.get<ReputationEvent[]>(`/users/${id}/reputation`);
    return response.data;
  }

  // ============================================================================
  // PAPER ENDPOINTS (To be implemented on backend)
  // ============================================================================

  async getPapers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    keywords?: string[];
  }): Promise<PaginatedResponse<Paper>> {
    const response = await this.client.get<PaginatedResponse<Paper>>('/papers', { params });
    return response.data;
  }

  async getPaper(id: string): Promise<Paper> {
    const response = await this.client.get<Paper>(`/papers/${id}`);
    return response.data;
  }

  async submitPaper(data: {
    title: string;
    abstract: string;
    keywords: string[];
    contentHash: string; // IPFS hash of the paper content
    authorKeys: string[];
  }): Promise<Paper> {
    const response = await this.client.post<Paper>('/papers', data);
    return response.data;
  }

  // ============================================================================
  // DISCUSSION ENDPOINTS (To be implemented on backend)
  // ============================================================================

  async getDiscussions(paperId: string): Promise<Discussion[]> {
    const response = await this.client.get<Discussion[]>(`/papers/${paperId}/discussions`);
    return response.data;
  }

  async createDiscussion(paperId: string, data: {
    content: string;
    parentId?: string;
  }): Promise<Discussion> {
    const response = await this.client.post<Discussion>(`/papers/${paperId}/discussions`, data);
    return response.data;
  }

  async updateDiscussion(id: string, content: string): Promise<Discussion> {
    const response = await this.client.patch<Discussion>(`/discussions/${id}`, { content });
    return response.data;
  }

  async deleteDiscussion(id: string): Promise<void> {
    await this.client.delete(`/discussions/${id}`);
  }

  async likeDiscussion(id: string): Promise<Discussion> {
    const response = await this.client.post<Discussion>(`/discussions/${id}/like`);
    return response.data;
  }
}

export const api = new ApiClient();
