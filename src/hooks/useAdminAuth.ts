"use client";

import { useEffect, useState } from 'react';
import { AdminUser, AdminRole, Permission, ROLE_PERMISSIONS, AdminUserStatus } from '@/types/adminUsers';
import { lambdaApi } from '@/lib/lambdaApi';

interface AuthContextType {
  user: AdminUser | null;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: AdminRole) => boolean;
  isLoading: boolean;
}

export const useAdminAuth = (): AuthContextType => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to decode JWT payload without verification (client-side only)
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔐 useAdminAuth effect starting...');
    
    // Development mode fallback - skip API calls if CORS is not configured
    const isDevelopment = process.env.NODE_ENV === 'development';
    const skipAuth = isDevelopment && process.env.NEXT_PUBLIC_SKIP_AUTH === 'true';
    
    if (skipAuth) {
      console.log('🔧 Development mode: Skipping authentication');
      // Create a mock admin user for development
      const mockUser: AdminUser = {
        id: 'dev-user-1',
        email: 'dev@admin.com',
        firstName: 'Dev',
        lastName: 'Admin',
        role: AdminRole.SUPERADMIN,
        status: AdminUserStatus.ACTIVE,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        createdBy: 'system',
        department: 'Development',
        cognitoSub: 'dev-cognito-sub'
      };
      setUser(mockUser);
      setIsLoading(false);
      return;
    }

    // Check if we have stored tokens
    const authToken = localStorage.getItem('authToken');
    const idToken = localStorage.getItem('idToken');
    
    console.log('🔐 Tokens check:', {
      hasAuthToken: !!authToken,
      hasIdToken: !!idToken,
      authTokenLength: authToken?.length,
      idTokenLength: idToken?.length
    });
    
    if (!authToken || !idToken) {
      console.log('❌ No auth tokens found');
      setIsLoading(false);
      return;
    }

    // Decode both tokens to get complete user information
    const idPayload = decodeJWT(idToken);
    const accessPayload = decodeJWT(authToken);
    
    console.log('🔐 Token decode results:', {
      idPayloadValid: !!idPayload,
      accessPayloadValid: !!accessPayload,
      idPayload: idPayload ? { sub: idPayload.sub, email: idPayload.email, exp: idPayload.exp } : null,
      accessPayload: accessPayload ? { sub: accessPayload.sub, groups: accessPayload['cognito:groups'], exp: accessPayload.exp } : null
    });
    
    if (!idPayload || !accessPayload) {
      console.log('❌ Invalid tokens');
      localStorage.removeItem('authToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      setIsLoading(false);
      return;
    }

    // Check if tokens are expired (check both tokens)
    const currentTime = Math.floor(Date.now() / 1000);
    if ((idPayload.exp && idPayload.exp < currentTime) || (accessPayload.exp && accessPayload.exp < currentTime)) {
      console.log('❌ Tokens expired', {
        currentTime,
        idTokenExp: idPayload.exp,
        accessTokenExp: accessPayload.exp
      });
      localStorage.removeItem('authToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      setIsLoading(false);
      return;
    }

    // Check if user has admin access (groups are in access token)
    const groups: string[] = accessPayload['cognito:groups'] || [];
    console.log('🔐 User groups:', groups);
    
    // Check if user has any admin access (accept multiple admin groups)
    const adminGroups = ['pi-superadmin', 'pi-admin', 'pi-manager', 'pi-support'];
    const hasAdminAccess = groups.some((group: string) => adminGroups.includes(group));
    
    if (!hasAdminAccess) {
      console.warn('❌ User does not have admin access - groups:', groups);
      localStorage.removeItem('authToken');
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      setIsLoading(false);
      return;
    }

    console.log('✅ User has admin access - groups:', groups);

    // Determine role based on group (map Cognito groups to application roles)
    let userRole = AdminRole.ADMIN; // Default
    if (groups.includes('pi-superadmin')) {
      userRole = AdminRole.SUPERADMIN;
    } else if (groups.includes('pi-admin')) {
      userRole = AdminRole.ADMIN;
    } else if (groups.includes('pi-manager')) {
      userRole = AdminRole.MANAGER;
    } else if (groups.includes('pi-support')) {
      userRole = AdminRole.SUPPORT;
    }

    // Create admin user object from JWT payloads (ID token has user info, access token has groups)
    const adminUser: AdminUser = {
      id: idPayload.sub || 'unknown',
      email: idPayload.email || 'unknown@email.com',
      firstName: idPayload.given_name || idPayload.preferred_username || 'Unknown',
      lastName: idPayload.family_name || 'User',
      role: userRole, // Use mapped role from groups
      status: AdminUserStatus.ACTIVE,
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(idPayload.auth_time * 1000),
      createdBy: 'cognito',
      department: 'Unknown',
      cognitoSub: idPayload.sub || 'unknown'
    };

    console.log('✅ Admin user authenticated:', adminUser);
    setUser(adminUser);
    setIsLoading(false);
  }, []);

  const permissions = user ? ROLE_PERMISSIONS[user.role] || [] : [];

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  const hasRole = (role: AdminRole): boolean => {
    return user?.role === role;
  };

  return {
    user,
    permissions,
    hasPermission,
    hasRole,
    isLoading,
  };
};
