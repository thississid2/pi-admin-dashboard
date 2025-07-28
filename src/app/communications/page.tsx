"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { MessageSquare } from "@/components/icons";

export default function CommunicationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
            <p className="text-gray-600">Manage emails, notifications, and messaging</p>
          </div>
          <button className="bg-[#1ABC9C] text-white px-4 py-2 rounded-lg hover:bg-[#16A085] transition">
            Send Message
          </button>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600">
            Communication management tools are currently in development.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
