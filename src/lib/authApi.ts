// Backend API configuration
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export const AUTH_API = {
  // Authentication endpoints
  LOGIN: `${BACKEND_URL}/auth/login`,
  LOGOUT: `${BACKEND_URL}/auth/logout`,
  USER: `${BACKEND_URL}/auth/user`,
  STATUS: `${BACKEND_URL}/auth/status`,
  REFRESH: `${BACKEND_URL}/auth/refresh`,
  
  // Health check
  HEALTH: `${BACKEND_URL}/health`,
} as const;

export const API_CONFIG = {
  BASE_URL: BACKEND_URL,
  TIMEOUT: 10000,
  WITH_CREDENTIALS: true,
} as const;

// API client with authentication
export class AuthApiClient {
  private baseURL: string;
  
  constructor(baseURL = BACKEND_URL) {
    this.baseURL = baseURL;
  }
  
  private async makeRequest(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
    
    return fetch(url, { ...defaultOptions, ...options });
  }
  
  async checkHealth(): Promise<{ status: string; service: string; cognito_configured: boolean }> {
    const response = await this.makeRequest('/health');
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }
  
  async getAuthStatus(): Promise<{
    authenticated: boolean;
    user?: any;
    token_expires_at?: number;
  }> {
    const response = await this.makeRequest('/auth/status');
    if (!response.ok) {
      throw new Error('Failed to get auth status');
    }
    return response.json();
  }
  
  async getCurrentUser(): Promise<{
    authenticated: boolean;
    user?: any;
  }> {
    const response = await this.makeRequest('/auth/user');
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    return response.json();
  }
  
  async refreshToken(): Promise<{
    message: string;
    expires_at?: number;
  }> {
    const response = await this.makeRequest('/auth/refresh', {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    return response.json();
  }
  
  // Redirect to backend login (which redirects to Cognito)
  redirectToLogin(): void {
    window.location.href = `${this.baseURL}/auth/login`;
  }
  
  // Redirect to backend logout (which redirects to Cognito logout)
  redirectToLogout(): void {
    window.location.href = `${this.baseURL}/auth/logout`;
  }
}

export const authApiClient = new AuthApiClient();
