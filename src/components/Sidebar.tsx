"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  UserCheck,
  FileText,
  Palette,
  Link as LinkIcon,
  MessageSquare,
  ShieldAlert,
  Music,
  Shield,
  Settings,
} from "@/components/icons";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

const sidebarItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    name: "Applications",
    href: "/applications",
    icon: Users,
  },
  {
    name: "User Management",
    href: "/user-management",
    icon: UserCheck,
  },
  {
    name: "API Documentation",
    href: "/api-documentation",
    icon: FileText,
  },
  {
    name: "Checkout Designs",
    href: "/checkout-designs",
    icon: Palette,
  },
  {
    name: "API Integrations",
    href: "/api-integrations",
    icon: LinkIcon,
  },
  {
    name: "Communications",
    href: "/communications",
    icon: MessageSquare,
  },
  {
    name: "Risk Management",
    href: "/risk-management",
    icon: ShieldAlert,
  },
  {
    name: "Pi Symphony",
    href: "/pi-symphony",
    icon: Music,
  },
  {
    name: "Pi Shield",
    href: "/pi-shield",
    icon: Shield,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar({ user: propUser }: { user?: User | null }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(propUser || null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    } else {
      // Get user data from localStorage only if not passed as prop
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, [propUser]);

  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-56 bg-[#2C3E50] min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#34495E]">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-[#1ABC9C] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">π</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-base">Client Admin</h1>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-[#34495E]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#34495E] text-white placeholder-gray-400 px-3 py-2 rounded-md border border-transparent focus:border-[#1ABC9C] focus:outline-none text-sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3">
        <ul className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm ${
                    isActive
                      ? "bg-[#1ABC9C] text-white"
                      : "text-gray-300 hover:bg-[#34495E] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium truncate">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-[#34495E]">
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:bg-[#34495E] rounded-md p-2 transition-colors"
          onClick={() => setShowUserDetails(!showUserDetails)}
        >
          <div className="w-7 h-7 bg-[#1ABC9C] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {user ? getInitials(user.username) : "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {user?.username || "Loading..."}
            </p>
            <p className="text-gray-400 text-xs truncate capitalize">
              {user?.role || "User"}
            </p>
          </div>
          <div className="w-2 h-2 bg-[#1ABC9C] rounded-full flex-shrink-0"></div>
        </div>
        
        {/* User Details Modal */}
        {showUserDetails && user && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowUserDetails(false)}
          >
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-[#1ABC9C] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {getInitials(user.username)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
                    <p className="text-gray-600 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="text-gray-900">{user.id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <p className="text-gray-900">{user.username}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : user.role === 'manager'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  
                  {user.createdAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Created</label>
                      <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="w-full bg-[#1ABC9C] text-white py-2 px-4 rounded-lg hover:bg-[#16A085] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
