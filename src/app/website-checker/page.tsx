"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
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
  score?: number;
}

interface CategoryScore {
  category: string;
  score: number;
  max_score: number;
}

interface WebsiteReport {
  domain: string;
  timestamp: string;
  trust_score?: number;
  trust_level?: string;
  overall_status?: string;
  category_scores?: CategoryScore[];
  results: CheckResult[];
  recommendation?: string;
}

export default function WebsiteChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<WebsiteReport | null>(null);
  const [error, setError] = useState("");

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

      // Call the enhanced legitimacy checker API
      const response = await fetch("/api/website-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: domain }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze website");
      }

      const reportData = await response.json();
      setReport(reportData);
    } catch (err) {
      setError("Failed to analyze website. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    // Create detailed report content
    const reportContent = `Website Legitimacy Report
========================

Domain: ${report.domain}
Generated: ${new Date(report.timestamp).toLocaleString()}

Overall Trust Score: ${report.trust_score}% (${report.trust_level})
Onboarding Recommendation: ${report.recommendation}

Category Breakdown:
${report.category_scores
  ?.map(
    (cat) =>
      `${cat.category}: ${cat.score}/${cat.max_score} (${Math.round(
        (cat.score / cat.max_score) * 100
      )}%)`
  )
  .join("\n")}

Detailed Results:
${report.results
  .map((r) => `${r.check}: ${r.result} ${r.score ? `(Score: ${r.score})` : ""}`)
  .join("\n")}

Report Complete.
Disclaimer: This is an automated analysis and should be used as part of a comprehensive due diligence process.
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legitimacy-report-${report.domain}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
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
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-[#2C3E50] hover:text-[#1ABC9C]"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Globe className="w-8 h-8 text-[#2C3E50]" />
            <div>
              <h1 className="text-2xl font-bold text-[#2C3E50]">
                Website Legitimacy Checker
              </h1>
              <p className="text-gray-600">
                Analyze website security and legitimacy
              </p>
            </div>
          </div>
        </div>

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
                onClick={downloadReport}
                className="flex items-center gap-2 bg-pi-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>

            <div className="p-6">
              {/* Trust Score Display */}
              {report.trust_score !== undefined && (
                <div className="mb-6 p-6 rounded-lg border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-pi-dark mb-2">
                      Overall Trust Score
                    </h3>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div
                        className={`text-4xl font-bold ${
                          report.trust_score >= 85
                            ? "text-green-600"
                            : report.trust_score >= 70
                            ? "text-blue-600"
                            : report.trust_score >= 50
                            ? "text-yellow-600"
                            : report.trust_score >= 30
                            ? "text-orange-600"
                            : "text-red-600"
                        }`}
                      >
                        {report.trust_score}%
                      </div>
                      <div className="text-center">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            report.trust_score >= 85
                              ? "bg-green-100 text-green-800"
                              : report.trust_score >= 70
                              ? "bg-blue-100 text-blue-800"
                              : report.trust_score >= 50
                              ? "bg-yellow-100 text-yellow-800"
                              : report.trust_score >= 30
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {report.trust_level}
                        </div>
                      </div>
                    </div>
                    {report.recommendation && (
                      <div
                        className={`text-sm p-3 rounded-lg ${
                          report.recommendation.includes("LOW RISK")
                            ? "bg-green-50 text-green-800 border border-green-200"
                            : report.recommendation.includes("MODERATE RISK")
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : report.recommendation.includes("ELEVATED RISK")
                            ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        <strong>Recommendation:</strong> {report.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              )}

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
      </div>
    </DashboardLayout>
  );
}
