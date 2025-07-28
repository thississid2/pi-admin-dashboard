"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Search, Globe } from "@/components/icons";

// Mock data for API documentation
const apiEndpoints = [
  {
    id: "api-001",
    name: "Payment Processing",
    endpoint: "/api/v1/payments",
    method: "POST",
    description: "Process payment transactions",
    version: "v1.2.0",
    status: "active",
  },
  {
    id: "api-002",
    name: "Merchant Verification",
    endpoint: "/api/v1/merchants/verify",
    method: "GET",
    description: "Verify merchant credentials",
    version: "v1.1.0",
    status: "active",
  },
  {
    id: "api-003",
    name: "Transaction History",
    endpoint: "/api/v1/transactions",
    method: "GET",
    description: "Retrieve transaction history",
    version: "v1.0.0",
    status: "deprecated",
  },
];

const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "text-green-700 bg-green-100";
    case "POST":
      return "text-blue-700 bg-blue-100";
    case "PUT":
      return "text-yellow-700 bg-yellow-100";
    case "DELETE":
      return "text-red-700 bg-red-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "text-green-700 bg-green-100";
    case "deprecated":
      return "text-red-700 bg-red-100";
    case "beta":
      return "text-yellow-700 bg-yellow-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
};

// Add the Code icon since it might not exist
const Code = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
    />
  </svg>
);

const Book = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

export default function APIDocumentationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              API Documentation
            </h1>
            <p className="text-gray-600">
              Comprehensive API reference and guides
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Download SDK
            </button>
            <button className="bg-[#1ABC9C] text-white px-4 py-2 rounded-lg hover:bg-[#16A085] transition">
              API Playground
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Endpoints
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {apiEndpoints.length}
                </p>
              </div>
              <Globe className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active APIs</p>
                <p className="text-2xl font-bold text-green-600">
                  {apiEndpoints.filter((api) => api.status === "active").length}
                </p>
              </div>
              <Code className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Documentation Pages
                </p>
                <p className="text-2xl font-bold text-blue-600">24</p>
              </div>
              <Book className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  API Calls Today
                </p>
                <p className="text-2xl font-bold text-purple-600">1,284</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#1ABC9C] transition cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Getting Started</h3>
                <p className="text-gray-600 text-sm">
                  Quick start guide and tutorials
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#1ABC9C] transition cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Code Examples</h3>
                <p className="text-gray-600 text-sm">Sample implementations</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#1ABC9C] transition cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">API Reference</h3>
                <p className="text-gray-600 text-sm">
                  Complete endpoint documentation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* API Endpoints Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                API Endpoints
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search endpoints..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent">
                  <option>All Methods</option>
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiEndpoints.map((api) => (
                  <tr key={api.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {api.name}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {api.endpoint}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(
                          api.method
                        )}`}
                      >
                        {api.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {api.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {api.version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          api.status
                        )}`}
                      >
                        {api.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#1ABC9C] hover:text-[#16A085] mr-4">
                        View Docs
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
