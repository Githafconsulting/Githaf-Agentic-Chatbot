import axios from 'axios';
import type {
  ChatResponse,
  Conversation,
  Document,
  Analytics,
  FlaggedQuery,
  LoginCredentials,
  AuthResponse,
  Feedback,
  DailyStats,
  CountryStats,
  SystemSettings,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiService {
  private api: ReturnType<typeof axios.create>;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        console.error('API Error Response:', error.response);
        console.error('API Error Config:', error.config);

        if (error.response?.status === 401) {
          console.warn('401 Unauthorized - Token may be invalid or expired');
          console.warn('Current path:', window.location.pathname);
          console.warn('Token exists:', !!localStorage.getItem('access_token'));

          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            console.warn('Redirecting to login...');
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Public APIs
  async sendMessage(message: string, sessionId: string): Promise<ChatResponse> {
    const response = await this.api.post('/api/v1/chat/', {
      message,
      session_id: sessionId,
    });
    return response.data;
  }

  async submitFeedback(feedback: Feedback): Promise<void> {
    await this.api.post('/api/v1/feedback/', feedback);
  }

  // Auth APIs
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // OAuth2 Password Flow expects x-www-form-urlencoded, NOT JSON
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Store token with correct key
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }

    return response.data;
  }

  // Document APIs
  async getDocuments(): Promise<Document[]> {
    const response = await this.api.get('/api/v1/documents/');
    // Backend returns { documents: [...], total: N }
    return response.data.documents || response.data;
  }

  async getDocument(id: string): Promise<Document> {
    const response = await this.api.get(`/api/v1/documents/${id}`);
    return response.data;
  }

  async uploadDocument(file: File, category?: string): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);  // Field name MUST be 'file'
    if (category) {
      formData.append('category', category);
    }

    const response = await this.api.post('/api/v1/documents/upload', formData, {
      headers: {
        // DO NOT set Content-Type - browser sets it with boundary
        'Content-Type': undefined as any,
      },
    });
    // Backend returns { success: true, document: {...} }
    return response.data.document || response.data;
  }

  async addDocumentFromUrl(url: string, category?: string): Promise<Document> {
    // URL endpoint expects form-urlencoded, NOT JSON
    const formData = new URLSearchParams();
    formData.append('url', url);
    if (category) {
      formData.append('category', category);
    }

    const response = await this.api.post('/api/v1/documents/url', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    // Backend returns { success: true, document: {...} }
    return response.data.document || response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await this.api.delete(`/api/v1/documents/${id}`);
  }

  // Conversation APIs
  async getConversations(): Promise<Conversation[]> {
    const response = await this.api.get('/api/v1/conversations/');
    // Backend returns { conversations: [...], total: N }
    return response.data.conversations || response.data;
  }

  async getConversation(id: string): Promise<any> {
    const response = await this.api.get(`/api/v1/conversations/${id}`);
    return response.data;
  }

  // Analytics APIs
  async getAnalytics(): Promise<Analytics> {
    const response = await this.api.get('/api/v1/analytics/');
    return response.data;
  }

  async getFlaggedQueries(): Promise<FlaggedQuery[]> {
    const response = await this.api.get('/api/v1/analytics/flagged');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // User Management APIs
  async getUsers(): Promise<any[]> {
    const response = await this.api.get('/api/v1/users/');
    return response.data;
  }

  async createUser(userData: {
    email: string;
    password: string;
    full_name?: string;
    is_admin?: boolean;
  }): Promise<any> {
    const response = await this.api.post('/api/v1/users/', userData);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.api.delete(`/api/v1/users/${userId}`);
  }

  // New Analytics APIs
  async getDailyStats(startDate: string, endDate: string): Promise<DailyStats[]> {
    const response = await this.api.get('/api/v1/analytics/daily', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data.daily_stats || response.data;
  }

  async getCountryStats(startDate?: string, endDate?: string): Promise<CountryStats[]> {
    const response = await this.api.get('/api/v1/analytics/countries', {
      params: startDate && endDate ? { start_date: startDate, end_date: endDate } : {},
    });
    return response.data.country_stats || response.data;
  }

  // System Settings APIs
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await this.api.get('/api/v1/settings/');
    return response.data;
  }

  async updateSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
    const response = await this.api.put('/api/v1/settings/', settings);
    return response.data;
  }
}

export const apiService = new ApiService();
