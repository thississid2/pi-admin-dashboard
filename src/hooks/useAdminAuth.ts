"use client";

import { useEffect, useState } from 'react';
import { AdminUser, AdminRole, Permission, ROLE_PERMISSIONS } from '@/types/adminUsers';
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

  useEffect(() => {
    // Get current user from Lambda API
    const fetchAdminUser = async () => {
      try {
        const adminUser = await lambdaApi.getCurrentUser() as AdminUser;
        setUser(adminUser);
      } catch (error) {
        console.error('Error fetching admin user:', error);
        // If unauthorized, user is not an admin or not authenticated
        if (error instanceof Error && error.message.includes('401')) {
          console.warn('User is not authenticated');
        } else if (error instanceof Error && error.message.includes('403')) {
          console.warn('User does not have admin access');
        }
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
