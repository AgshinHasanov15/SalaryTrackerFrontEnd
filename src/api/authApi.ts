import { apiFetch } from './config';

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

// Store token in memory and localStorage
let authToken: string | null = localStorage.getItem('auth_token');

export function getAuthToken(): string | null {
  return authToken;
}

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Call backend login
    const response = await apiFetch<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // ✅ Store token immediately
    setAuthToken(response.token);

    // ✅ Return full response including user
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // ✅ Store token
    setAuthToken(response.token);

    // ✅ Return full response including user
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      setAuthToken(null);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = getAuthToken();
    if (!token) return null;

    try {
      return await apiFetch<User>('/me', {
        headers: getAuthHeaders(),
      });
    } catch {
      setAuthToken(null);
      return null;
    }
  },
};
