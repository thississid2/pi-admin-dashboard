"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApiClient } from "@/lib/authApi";

interface User {
  sub: string;
  email: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const authStatus = await authApiClient.getAuthStatus();
      
      if (authStatus.authenticated && authStatus.user) {
        setUser(authStatus.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove dependencies to prevent infinite loop

  const refreshAuth = useCallback(async () => {
    try {
      await authApiClient.refreshToken();
      // Re-check auth status after refresh
      const authStatus = await authApiClient.getAuthStatus();
      
      if (authStatus.authenticated && authStatus.user) {
        setUser(authStatus.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      // If refresh fails, clear auth state
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []); // Remove checkAuth dependency to prevent infinite loop

  const login = useCallback(() => {
    // Redirect to backend login endpoint
    authApiClient.redirectToLogin();
  }, []);

  const logout = useCallback(() => {
    // Clear local state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to backend logout endpoint
    authApiClient.redirectToLogout();
  }, []);

  // Check auth status on mount and when page becomes visible
  useEffect(() => {
    checkAuth();
    
    // Check auth when page becomes visible (in case user logged in/out in another tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Remove checkAuth dependency to prevent infinite loop

  // Set up token refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      // Refresh token every 50 minutes (tokens typically expire in 60 minutes)
      const refreshInterval = setInterval(() => {
        refreshAuth();
      }, 50 * 60 * 1000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated]); // Remove refreshAuth dependency to prevent infinite loop

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
    checkAuth,
  };
};
