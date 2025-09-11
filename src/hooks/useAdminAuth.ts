"use client";

import { useEffect, useState } from 'react';
import { AdminUser, AdminRole, Permission, ROLE_PERMISSIONS } from '@/types/adminUsers';

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

  useEffect(() => {
    // Get current user from auth API and map to admin user
    const fetchAdminUser = async () => {
      try {
        const response = await fetch('/api/auth/admin-user', {
          credentials: 'include' // Include cookies for session-based auth
        });
        if (response.ok) {
          const adminUser = await response.json();
          setUser(adminUser);
        } else if (response.status === 403) {
          // User is authenticated but doesn't have admin access
          console.warn('User does not have admin access');
        }
      } catch (error) {
        console.error('Error fetching admin user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminUser();
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
