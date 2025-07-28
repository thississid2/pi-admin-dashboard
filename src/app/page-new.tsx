"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Users, BarChart3, AlertTriangle } from "@/components/icons";

// Mock data for the dashboard stats
const stats = {
  activeClients: 2,
  monthlyVolume: "$4.2M",
  avgHealthScore: "84.7%",
  criticalAlerts: 1,
};

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Clients */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Active Clients
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeClients}
              </p>
              <p className="text-green-600 text-sm font-medium">
                +12% vs last month
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Monthly Volume */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Monthly Volume
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.monthlyVolume}
              </p>
              <p className="text-green-600 text-sm font-medium">
                +8.2% vs last month
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Avg Health Score */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Avg Health Score
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.avgHealthScore}
              </p>
              <p className="text-green-600 text-sm font-medium">
                +2.1% vs last month
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">
                Critical Alerts
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.criticalAlerts}
              </p>
              <p className="text-red-600 text-sm font-medium">
                Needs attention
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Status
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">All systems operational</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
