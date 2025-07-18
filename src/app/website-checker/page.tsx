"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from "@/components/icons";

interface CheckResult {
  check: string;
  result: string;
  status: "success" | "warning" | "error" | "info";
}

interface WebsiteReport {
  domain: string;
  timestamp: string;
  results: CheckResult[];
}

export default function WebsiteChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<WebsiteReport | null>(null);
  const [error, setError] = useState("");

  const mockCheck = async (domain: string): Promise<WebsiteReport> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    return {
      domain,
      timestamp: new Date().toISOString(),
      results: [
        { check: "HTTPS Connection", result: "Successful", status: "success" },
        { check: "HTTP -> HTTPS Redirect", result: "Yes", status: "success" },
        { check: "Contact Page", result: "Found", status: "success" },
        { check: "Privacy Page", result: "Found", status: "success" },
        { check: "Terms Page", result: "Found", status: "success" },
        { check: "Refund Page", result: "Not Found", status: "warning" },
        { check: "About Page", result: "Found", status: "success" },
        {
          check: "Domain Status",
          result: "clientTransferProhibited",
          status: "success",
        },
        { check: "Creation Date", result: "2020-03-15", status: "success" },
        {
          check: "Domain Age",
          result: "1,765 days (approx. 4 years)",
          status: "success",
        },
        { check: "Blacklist Status", result: "Clean", status: "success" },
      ],
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setReport(null);

    try {
      // Extract domain from URL
      const domain = url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];
      const reportData = await mockCheck(domain);
      setReport(reportData);
    } catch (err) {
      setError("Failed to analyze website. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!report) return;

    // Create PDF content
    const pdfContent = `
Website Legitimacy Report
========================

Domain: ${report.domain}
Generated: ${new Date(report.timestamp).toLocaleString()}

Detailed Results:
${report.results.map((r) => `${r.check}: ${r.result}`).join("\n")}

Report Complete.
Disclaimer: This is an automated check and not a guarantee of legitimacy.
    `;

    const blob = new Blob([pdfContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-for-${report.domain}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-700 bg-green-50 border-green-200";
      case "warning":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "error":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-blue-700 bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f8fa] to-[#eaf6f0]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="flex items-center space-x-4">
              <Globe className="w-8 h-8 text-pi-dark" />
              <div>
                <h1 className="text-2xl font-bold text-pi-dark">
                  Website Legitimacy Checker
                </h1>
                <p className="text-gray-600">
                  Analyze website security and legitimacy
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Website URL
              </label>
              <div className="flex gap-4">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pi-dark focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-pi-dark text-white rounded-lg hover:bg-pi-dark-light disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Analyze Website
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
            <div className="w-12 h-12 border-4 border-pi-dark border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-pi-dark mb-2">
              Analyzing Website
            </h3>
            <p className="text-gray-600">This may take a few moments...</p>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <p>✅ Checking HTTPS security</p>
              <p>🔍 Discovering key pages</p>
              <p>📋 Performing WHOIS lookup</p>
              <p>🛡️ Checking spam blacklists</p>
            </div>
          </div>
        )}

        {/* Report Results */}
        {report && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-pi-dark">
                  Legitimacy Report for {report.domain}
                </h2>
                <p className="text-sm text-gray-600">
                  Generated on {new Date(report.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-pi-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            <div className="p-6">
              <div className="grid gap-4">
                {report.results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(
                      result.status
                    )}`}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.check}</span>
                    </div>
                    <span className="text-sm">{result.result}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-pi-dark mb-2">Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {
                        report.results.filter((r) => r.status === "success")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {
                        report.results.filter((r) => r.status === "warning")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Warnings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {
                        report.results.filter((r) => r.status === "error")
                          .length
                      }
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Disclaimer: This is an automated check and not a guarantee of
                legitimacy.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
