"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  FileText,
  Globe,
  BarChart3,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Search,
  Filter,
  AlertTriangle,
} from "@/components/icons";

// Format date consistently for both server and client to avoid hydration errors
const formatDate = (dateString: string, isClient: boolean = true) => {
  if (!isClient) {
    // Return a placeholder for server-side rendering
    return "Loading...";
  }
  // Parse the date in UTC to avoid timezone issues
  const date = new Date(dateString + "T00:00:00.000Z");
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${month}/${day}/${year}`;
};

// Mock data - replace with real API calls
const mockMerchants = [
  {
    id: "AB-12345",
    name: "Gayatri Tech Solutions",
    email: "gayatri@techsolutions.com",
    website: "https://techsolutions.com",
    status: "approved",
    submittedAt: "2025-01-15",
    documents: ["PAN Card", "GST Certificate", "CIN Document"],
    country: "India",
  },
  {
    id: "CD-67890",
    name: "Global Innovations Ltd",
    email: "admin@globalinnovations.co.uk",
    website: "https://globalinnovations.co.uk",
    status: "pending",
    submittedAt: "2025-01-18",
    documents: ["Company Registration", "VAT Certificate"],
    country: "UK",
  },
  {
    id: "EF-13579",
    name: "Digital Ventures Inc",
    email: "contact@digitalventures.com",
    website: "https://digitalventures.com",
    status: "under_review",
    submittedAt: "2025-01-17",
    documents: ["Articles of Incorporation", "Tax ID"],
    country: "USA",
  },
];

const stats = {
  totalMerchants: 156,
  pendingReviews: 23,
  approvedToday: 8,
  rejectedThisWeek: 3,
};

export default function AdminDashboard() {
  const [merchants, setMerchants] = useState(mockMerchants);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredMerchants = merchants.filter((merchant) => {
    const matchesSearch =
      merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    return matchesSearch && merchant.status === filter;
  });

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
        return <FileText className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      {/* Website Checker Button - Moved to top right */}
      <div className="flex justify-end mb-6">
        <Link
          href="/website-checker"
          className="flex items-center gap-2 bg-[#1ABC9C] text-white px-4 py-2 rounded-lg hover:bg-[#16A085] transition"
        >
          <Globe className="w-4 h-4" />
          Website Checker
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Merchants
              </p>
              <p className="text-2xl font-bold text-[#2C3E50]">
                {stats.totalMerchants}
              </p>
            </div>
            <Users className="w-8 h-8 text-[#2C3E50]" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Reviews
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pendingReviews}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Approved Today
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approvedToday}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Rejected This Week
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejectedThisWeek}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search merchants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent bg-white text-gray-900 cursor-pointer min-w-[140px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 0.5rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.5em 1.5em",
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredMerchants.length} of {merchants.length} merchants
          </div>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#2C3E50]">
            Merchant Applications
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMerchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {merchant.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {merchant.email}
                      </div>
                      <div className="text-xs text-blue-600 truncate">
                        {merchant.website}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="font-mono text-xs text-gray-900">
                      {merchant.id}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        merchant.status
                      )}`}
                    >
                      {getStatusIcon(merchant.status)}
                      <span className="truncate">{merchant.status.replace("_", " ")}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {merchant.documents.length} docs
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(merchant.submittedAt, isClient)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link
                        href={`/merchants/${merchant.id}`}
                        className="text-[#1ABC9C] hover:text-[#16A085] text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
