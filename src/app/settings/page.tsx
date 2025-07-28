"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Settings, Users, Globe, Shield } from "@/components/icons";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">
              Manage system configuration and preferences
            </p>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Settings */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                General Settings
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  System Name
                </label>
                <input
                  type="text"
                  defaultValue="Pi Admin Dashboard"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <div className="relative">
                  <select
                    className="appearance-none w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-[#1ABC9C] bg-white shadow-sm hover:border-gray-400 transition-colors"
                    style={{
                      backgroundImage: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                    }}
                  >
                    <option>UTC</option>
                    <option>EST</option>
                    <option>PST</option>
                    <option>GMT</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Maintenance Mode
                </span>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:ring-offset-2 bg-gray-200">
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                User Management
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Allow User Registration
                </span>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:ring-offset-2 bg-[#1ABC9C]">
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Require Email Verification
                </span>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:ring-offset-2 bg-[#1ABC9C]">
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  defaultValue="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                API Configuration
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Base URL
                </label>
                <input
                  type="url"
                  defaultValue="https://api.pi-admin.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Limit (requests/minute)
                </label>
                <input
                  type="number"
                  defaultValue="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Enable API Logging
                </span>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:ring-offset-2 bg-[#1ABC9C]">
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Two-Factor Authentication
                </span>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:ring-offset-2 bg-[#1ABC9C]">
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  IP Whitelist
                </span>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:ring-offset-2 bg-gray-200">
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Policy
                </label>
                <div className="relative">
                  <select
                    className="appearance-none w-full px-3 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-[#1ABC9C] bg-white shadow-sm hover:border-gray-400 transition-colors"
                    style={{
                      backgroundImage: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                    }}
                  >
                    <option>
                      Strong (8+ chars, mixed case, numbers, symbols)
                    </option>
                    <option>Medium (6+ chars, mixed case, numbers)</option>
                    <option>Basic (6+ chars)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-[#1ABC9C] text-white px-6 py-2 rounded-lg hover:bg-[#16A085] transition">
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
