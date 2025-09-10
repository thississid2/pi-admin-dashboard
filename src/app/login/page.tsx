"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, User } from "@/components/icons";
import { useAuth } from "@/hooks/useAuthCognito";
import { authApiClient } from "@/lib/authApi";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Check backend health on component mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await authApiClient.checkHealth();
        setBackendStatus('online');
      } catch (error) {
        setBackendStatus('offline');
        setError("Authentication service is currently unavailable. Please try again later.");
      }
    };

    checkBackend();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (backendStatus === 'offline') {
      setError("Authentication service is unavailable. Please try again later.");
      setIsLoading(false);
      return;
    }

    try {
      // Use AWS Cognito authentication via backend
      login();
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1ABC9C] to-[#16A085] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-[#1ABC9C]">π</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Pi Admin</h1>
          <p className="text-white/80">Internal Dashboard Access</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in with your AWS Cognito account</p>
            {backendStatus === 'checking' && (
              <div className="mt-2 flex items-center text-sm text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Connecting to authentication service...
              </div>
            )}
            {backendStatus === 'online' && (
              <div className="mt-2 flex items-center text-sm text-green-600">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                Authentication service online
              </div>
            )}
            {backendStatus === 'offline' && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                Authentication service unavailable
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info about AWS Cognito */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Secure Authentication
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Click "Sign In with AWS Cognito" to authenticate securely using AWS Cognito User Pool.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AWS Cognito Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || backendStatus === 'offline'}
              className="w-full bg-[#FF9900] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#E88B00] focus:ring-2 focus:ring-[#FF9900] focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Redirecting to AWS Cognito...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.25 6c.69 0 1.25.56 1.25 1.25v9.5c0 .69-.56 1.25-1.25 1.25S6 17.44 6 16.75v-9.5C6 6.56 6.56 6 7.25 6zm4.5 0c.69 0 1.25.56 1.25 1.25v9.5c0 .69-.56 1.25-1.25 1.25s-1.25-.56-1.25-1.25v-9.5c0-.69.56-1.25 1.25-1.25zm4.5 0c.69 0 1.25.56 1.25 1.25v9.5c0 .69-.56 1.25-1.25 1.25s-1.25-.56-1.25-1.25v-9.5c0-.69.56-1.25 1.25-1.25z"/>
                  </svg>
                  Sign In with AWS Cognito
                </>
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <div className="text-gray-600 text-sm">
              Secure authentication powered by{" "}
              <span className="text-[#FF9900] font-medium">AWS Cognito</span>
            </div>
            <div className="text-xs text-gray-500">
              Your credentials are managed securely by Amazon Web Services
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          © 2025 Pi Admin Dashboard. Internal Use Only.
        </div>
      </div>
    </div>
  );
}
