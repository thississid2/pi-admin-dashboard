"use client";


import { useEffect } from "react";

export default function LoginPage() {
  useEffect(() => {
    const cognitoClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const redirectUri = `${window.location.origin}/auth/callback`;
    if (cognitoClientId && cognitoDomain) {
      const cognitoLoginUrl = `https://${cognitoDomain}/login?client_id=${cognitoClientId}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.replace(cognitoLoginUrl);
    }
  }, []);
  return null;
}