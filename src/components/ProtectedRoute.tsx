"use client";

import { useAuth } from "@/hooks/useAuthCognito";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-[#1ABC9C] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting to login (DashboardLayout will handle the redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
