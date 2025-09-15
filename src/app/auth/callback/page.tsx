"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the authorization code from URL params
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        if (error) {
          setStatus('error');
          setMessage(error || 'Authentication failed');
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        // Exchange the authorization code for tokens
        // This would typically be done by calling your backend/Lambda
        // For now, we'll simulate success and redirect
        
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Authentication processing failed');
      }
    };

    handleAuthCallback();
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
                <p className="text-gray-600">Please wait while we complete your sign in...</p>
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
                  Authentication Successful
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
                  Authentication Failed
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