"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import NotificationPanel from "@/components/NotificationPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
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
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-gray-700 font-medium text-sm">
                    John Smith
                  </p>
                  <p className="text-gray-500 text-xs">Admin</p>
                </div>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JS</span>
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
