"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('Authentication failed');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      // Map common error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        'access_denied': 'Access was denied. Please try again.',
        'invalid_request': 'Invalid authentication request. Please try again.',
        'unauthorized_client': 'This application is not authorized. Please contact support.',
        'unsupported_response_type': 'Unsupported authentication method. Please contact support.',
        'invalid_scope': 'Invalid authentication scope. Please contact support.',
        'server_error': 'Authentication server error. Please try again later.',
        'temporarily_unavailable': 'Authentication service is temporarily unavailable. Please try again later.',
        'authentication_failed': 'Authentication failed. Please check your credentials and try again.'
      };
      
      setErrorMessage(errorMessages[error] || `Authentication error: ${error}`);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1ABC9C] to-[#16A085] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-[#1ABC9C] text-white px-6 py-2 rounded-lg hover:bg-[#16A085] transition"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = 'mailto:support@pi-admin.com?subject=Authentication Issue'}
                className="w-full bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthErrorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1ABC9C] to-[#16A085] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ABC9C] mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-[#2C3E50] mb-2">
              Loading
            </h2>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorLoading />}>
      <AuthErrorContent />
    </Suspense>
  );
}