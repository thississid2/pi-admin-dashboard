"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
} from "@/components/icons";

// Mock data for applications
const applications = [
  {
    id: "APP-001",
    companyName: "TechCorp Solutions",
    email: "contact@techcorp.com",
    status: "pending",
    submittedAt: "2025-01-15",
    type: "Standard",
  },
  {
    id: "APP-002",
    companyName: "Global Payments Ltd",
    email: "admin@globalpay.com",
    status: "approved",
    submittedAt: "2025-01-12",
    type: "Enterprise",
  },
  {
    id: "APP-003",
    companyName: "StartupPay Inc",
    email: "hello@startuppay.com",
    status: "under_review",
    submittedAt: "2025-01-18",
    type: "Startup",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "text-green-700 bg-green-100";
    case "pending":
      return "text-yellow-700 bg-yellow-100";
    case "under_review":
      return "text-blue-700 bg-blue-100";
    case "rejected":
      return "text-red-700 bg-red-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="w-4 h-4" />;
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "under_review":
      return <Clock className="w-4 h-4" />;
    case "rejected":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export default function ApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter applications based on search term and status
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        app.status.toLowerCase() === statusFilter.toLowerCase() ||
        (statusFilter === "under review" && app.status === "under_review");

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600">
              Manage merchant application submissions
            </p>
          </div>
          <button className="bg-[#1ABC9C] text-white px-4 py-2 rounded-lg hover:bg-[#16A085] transition">
            New Application
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Applications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredApplications.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    filteredApplications.filter(
                      (app) => app.status === "pending"
                    ).length
                  }
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    filteredApplications.filter(
                      (app) => app.status === "approved"
                    ).length
                  }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Applications
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-[#1ABC9C] bg-white min-w-[140px] shadow-sm hover:border-gray-400 transition-colors"
                    style={{
                      backgroundImage: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="under review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
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

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">
                          {app.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {app.companyName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {app.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {getStatusIcon(app.status)}
                          {app.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {app.submittedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-[#1ABC9C] hover:text-[#16A085] text-sm font-medium">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No applications found
                        </h3>
                        <p className="text-gray-500">
                          Try adjusting your search or filter criteria to find
                          what you're looking for.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
