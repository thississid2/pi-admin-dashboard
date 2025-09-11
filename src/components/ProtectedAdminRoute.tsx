"use client";

import { ReactNode } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Permission, AdminRole } from '@/types/adminUsers';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: Permission[];
  requiredRoles?: AdminRole[];
  fallback?: ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredPermissions = [],
  requiredRoles = [],
  fallback = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    </div>
  ),
}: ProtectedRouteProps) {
  const { user, hasPermission, hasRole, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ABC9C]"></div>
      </div>
    );
  }

  if (!user) {
    return fallback;
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    if (!hasAllPermissions) {
      return fallback;
    }
  }

  // Check if user has required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      return fallback;
    }
  }

  return <>{children}</>;
}
