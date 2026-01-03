import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { authApi, User, getAuthToken, setAuthToken } from '@/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load current user on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const currentUser = await authApi.getCurrentUser();
          setUser(currentUser); // set user immediately
        } catch {
          setAuthToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const response = await authApi.login({
          email: email.toLowerCase().trim(),
          password,
        });

        // ✅ Immediately set token and user
        setAuthToken(response.token);
        setUser(response.user);

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error?.message || 'Login failed' };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const response = await authApi.register({
          email: email.toLowerCase().trim(),
          password,
          fullName: name,
        });

        setAuthToken(response.token);
        setUser(response.user);

        return { success: true };
      } catch (error: any) {
        const message = error?.message || 'Registration failed';
        if (message.includes('already registered') || message.includes('already exists')) {
          return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
        }
        return { success: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
