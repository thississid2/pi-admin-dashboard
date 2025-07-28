"use client";

import { useState } from "react";

interface Notification {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  timestamp: string;
  icon: string;
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Stripe integration updated successfully",
    timestamp: "1/28/2025, 3:30:00 PM",
    icon: "✓"
  },
  {
    id: "2", 
    type: "warning",
    title: "Pi Symphony trial expires in 5 days",
    timestamp: "1/28/2025, 3:00:00 PM",
    icon: "⚠"
  },
  {
    id: "3",
    type: "info",
    title: "New team member invitation sent", 
    timestamp: "1/28/2025, 2:30:00 PM",
    icon: "ℹ"
  }
];

export default function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div key={notification.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                notification.type === "success" 
                  ? "bg-green-100 text-green-600" 
                  : notification.type === "warning"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-blue-100 text-blue-600"
              }`}>
                {notification.type === "success" && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === "warning" && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === "info" && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-gray-50 rounded-b-lg">
        <button className="w-full text-center text-sm text-[#1ABC9C] font-medium hover:text-[#16A085] transition-colors">
          View all notifications
        </button>
      </div>
    </div>
  );
}
