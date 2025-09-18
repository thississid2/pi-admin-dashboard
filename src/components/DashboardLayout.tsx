"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import NotificationPanel from "@/components/NotificationPanel";
import { useAdminAuth } from "@/hooks/useAdminAuth";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { user: adminUser, isLoading } = useAdminAuth(); // Using Lambda-based admin auth

  // Note: Authentication redirect is now handled in the main page.tsx component

  useEffect(() => {
    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      // Clear the authentication token
      localStorage.removeItem('authToken');
      // Clear any other stored auth data
      localStorage.removeItem('userInfo');
      localStorage.removeItem('refreshToken');
      
      // For Lambda-based auth, we'll redirect to login immediately
      // In a full implementation, you'd call a logout endpoint first
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout fails
      router.push("/login");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserDisplayName = () => {
    if (!adminUser) return "Admin";
    return `${adminUser.firstName} ${adminUser.lastName}` || adminUser.email?.split("@")[0] || "User";
  };

  const getUserRole = () => {
    // Get role from admin auth context
    if (adminUser?.role) {
      switch (adminUser.role) {
        case 'SUPERADMIN':
          return 'Super Admin';
        case 'ADMIN':
          return 'Admin';
        case 'MANAGER':
          return 'Manager';
        case 'SUPPORT':
          return 'Support';
        default:
          return adminUser.role;
      }
    }
    return "Admin"; // Fallback
  };

  // Show loading state while checking authentication - handled in main page
  // This component assumes user is already authenticated
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar user={adminUser} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2C3E50]">Dashboard</h1>
              <p className="text-gray-600">
                Overview of your payment gateway operations
              </p>
            </div>
            <div className="flex items-center space-x-4 relative">
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-5-5 5-5h-5m-6 10v4a1 1 0 01-1 1H9a1 1 0 01-1-1v-4m8 0V9a1 1 0 00-1-1H9a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1z"
                    />
                  </svg>
                </button>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <NotificationPanel
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                />
              </div>
              <div className="relative">
                <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex items-center space-x-3 relative">
                <div className="text-right">
                  <p className="text-gray-700 font-medium text-sm">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-gray-500 text-xs capitalize">
                    {getUserRole()}
                  </p>
                </div>
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-8 h-8 bg-[#1ABC9C] rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-[#16A085] transition-colors"
                  >
                    {adminUser ? getInitials(getUserDisplayName()) : "A"}
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500">{adminUser?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
