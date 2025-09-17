"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Extract tokens from URL parameters (set by Lambda redirect)
        const accessToken = searchParams.get('access_token');
        const idToken = searchParams.get('id_token');
        const refreshToken = searchParams.get('refresh_token');
        
        if (!accessToken) {
          setStatus('error');
          setMessage('No access token received from authentication service');
          return;
        }

        // Store the access token for future API calls
        localStorage.setItem('authToken', accessToken);
        
        // Optionally store other tokens
        if (idToken) {
          localStorage.setItem('idToken', idToken);
        }
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        setStatus('success');
        setMessage('Authentication successful! Redirecting to dashboard...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/');
        }, 1500);
        
      } catch (error) {
        console.error('Auth success processing error:', error);
        setStatus('error');
        setMessage('Failed to process authentication tokens');
      }
    };

    handleAuthSuccess();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1ABC9C] to-[#16A085] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            {status === 'processing' && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ABC9C] mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-[#2C3E50] mb-2">
                  Processing Authentication
                </h2>
                <p className="text-gray-600">Completing your sign in...</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-green-600 mb-2">
                  Authentication Successful!
                </h2>
                <p className="text-gray-600">{message}</p>
              </>
            )}
            
            {status === 'error' && (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-red-600 mb-2">
                  Authentication Error
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-[#1ABC9C] text-white px-6 py-2 rounded-lg hover:bg-[#16A085] transition"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthSuccessLoading() {
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

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<AuthSuccessLoading />}>
      <AuthSuccessContent />
    </Suspense>
  );
}