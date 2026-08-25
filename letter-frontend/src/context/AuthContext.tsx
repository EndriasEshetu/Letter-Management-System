import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, ChangePasswordPayload, LoginCredentials } from '@/types/auth';
import { authService } from '@/services/authService';

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from local storage and backend check
  const initAuth = useCallback(async () => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('sita_auth_token');
    const storedUser = localStorage.getItem('sita_auth_user');

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // invalid JSON
      }
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('sita_auth_user', JSON.stringify(currentUser));
    } catch (error) {
      console.warn('[AuthContext] Failed to validate current token, logging out:', error);
      localStorage.removeItem('sita_auth_token');
      localStorage.removeItem('sita_auth_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Login handler
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);

      localStorage.setItem('sita_auth_token', response.token);
      localStorage.setItem('sita_auth_user', JSON.stringify(response.user));
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('sita_auth_token');
    localStorage.removeItem('sita_auth_user');
    setToken(null);
    setUser(null);
  }, []);

  // Refresh current user metadata
  const refreshUser = async () => {
    if (!token) return;
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('sita_auth_user', JSON.stringify(currentUser));
    } catch (error) {
      console.error('[AuthContext] Error refreshing user info:', error);
    }
  };

  // Change password handler
  const changePassword = async (payload: ChangePasswordPayload) => {
    await authService.changePassword(payload);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    logout,
    refreshUser,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
