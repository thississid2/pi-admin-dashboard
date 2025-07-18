"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Globe,
  Mail,
  Calendar,
} from "@/components/icons";

// Format date consistently for both server and client
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
};

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: "verified" | "pending" | "rejected";
}

interface MerchantDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  status: string;
  submittedAt: string;
  country: string;
  businessAddress: {
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: string;
    turnover: string;
  };
  documents: Document[];
  socials: string[];
}

// Mock data - replace with API call
const mockMerchant: MerchantDetails = {
  id: "AB-12345",
  name: "Gayatri Tech Solutions",
  email: "gayatri@techsolutions.com",
  phone: "+91 9876543210",
  website: "https://techsolutions.com",
  status: "approved",
  submittedAt: "2025-01-15",
  country: "India",
  businessAddress: {
    address1: "123 Tech Park",
    address2: "Suite 456",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    turnover: "₹50,00,000",
  },
  documents: [
    {
      id: "1",
      name: "Company PAN Card.pdf",
      type: "Company PAN Card",
      size: 204800,
      uploadedAt: "2025-01-15",
      status: "verified",
    },
    {
      id: "2",
      name: "GST Certificate.pdf",
      type: "GST Certificate",
      size: 512000,
      uploadedAt: "2025-01-15",
      status: "verified",
    },
    {
      id: "3",
      name: "CIN Document.pdf",
      type: "CIN Document",
      size: 102400,
      uploadedAt: "2025-01-15",
      status: "pending",
    },
  ],
  socials: [
    "https://twitter.com/techsolutions",
    "https://linkedin.com/company/techsolutions",
  ],
};

export default function MerchantDetail({ params }: { params: { id: string } }) {
  const [merchant] = useState<MerchantDetails>(mockMerchant);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "verified":
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
      case "verified":
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

  const handleDownloadDocument = (doc: Document) => {
    // Mock download - replace with actual file download logic
    const blob = new Blob([`Mock content for ${doc.name}`], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = doc.name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateDocumentStatus = (
    documentId: string,
    newStatus: "verified" | "rejected"
  ) => {
    // Mock update - replace with API call
    console.log(`Updating document ${documentId} to ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f8fa] to-[#eaf6f0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-pi-dark hover:text-pi-dark-light"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </Link>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-pi-dark">
                Merchant Details
              </h1>
              <p className="text-gray-600">Application #{merchant.id}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Merchant Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-pi-dark">
                  Business Information
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    merchant.status
                  )}`}
                >
                  {getStatusIcon(merchant.status)}
                  {merchant.status.replace("_", " ")}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <p className="text-gray-900">{merchant.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{merchant.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">{merchant.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a
                      href={merchant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {merchant.website}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <p className="text-gray-900">{merchant.country}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submitted
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">
                      {new Date(merchant.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Address */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-pi-dark mb-6">
                Business Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <p className="text-gray-900">
                    {merchant.businessAddress.address1}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <p className="text-gray-900">
                    {merchant.businessAddress.address2}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <p className="text-gray-900">
                    {merchant.businessAddress.city}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <p className="text-gray-900">
                    {merchant.businessAddress.state}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <p className="text-gray-900">
                    {merchant.businessAddress.postalCode}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Turnover
                  </label>
                  <p className="text-gray-900">
                    {merchant.businessAddress.turnover}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            {merchant.socials.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-pi-dark mb-6">
                  Social Media Presence
                </h2>
                <div className="space-y-2">
                  {merchant.socials.map((social, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={social}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {social}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-pi-dark mb-6">
                Documents
              </h2>
              <div className="space-y-4">
                {merchant.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {doc.type}
                        </h3>
                        <p className="text-sm text-gray-600">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatSize(doc.size)} •{" "}
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          doc.status
                        )}`}
                      >
                        {getStatusIcon(doc.status)}
                        {doc.status}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </button>
                    </div>

                    {doc.status === "pending" && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() =>
                            updateDocumentStatus(doc.id, "verified")
                          }
                          className="flex-1 bg-green-600 text-white text-xs py-1 px-2 rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            updateDocumentStatus(doc.id, "rejected")
                          }
                          className="flex-1 bg-red-600 text-white text-xs py-1 px-2 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-pi-dark mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href={`/website-checker?url=${encodeURIComponent(
                    merchant.website
                  )}`}
                  className="flex items-center gap-2 bg-pi-dark text-white px-4 py-2 rounded-lg hover:bg-pi-dark-light transition w-full text-center justify-center"
                >
                  <Globe className="w-4 h-4" />
                  Check Website Legitimacy
                </Link>
                <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition w-full justify-center">
                  <Mail className="w-4 h-4" />
                  Send Email
                </button>
                <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition w-full justify-center">
                  <FileText className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">{selectedDocument.name}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">PDF Preview</p>
                <p className="text-sm text-gray-500">{selectedDocument.name}</p>
                <button
                  onClick={() => handleDownloadDocument(selectedDocument)}
                  className="mt-4 flex items-center gap-2 bg-pi-dark text-white px-4 py-2 rounded-lg hover:bg-pi-dark-light transition mx-auto"
                >
                  <Download className="w-4 h-4" />
                  Download Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
