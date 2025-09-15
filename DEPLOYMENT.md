# 🚀 Quick Deployment Guide

## Current Setup Status
✅ Lambda functions deployed to: `https://cyg01jt62k.execute-api.ap-south-1.amazonaws.com/dev/`
✅ Frontend configured to use Lambda backend
✅ Environment variables updated

## Deploy Commands

### Lambda Backend
```bash
# Development
npm run deploy:lambda

# Production  
npm run deploy:lambda:prod
```

### Frontend (Choose one)

#### Option 1: AWS Amplify (Recommended)
1. Push code to Git repository
2. Connect repository to AWS Amplify
3. Deploy automatically on git push

#### Option 2: Vercel
```bash
npm i -g vercel
vercel
```

#### Option 3: Build locally
```bash
npm run build
npm start
```

## Environment Variables for Production

Set these in your deployment platform:

```bash
NEXT_PUBLIC_LAMBDA_API_URL=https://cyg01jt62k.execute-api.ap-south-1.amazonaws.com/dev
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-south-1_NK3qZ5B7u
NEXT_PUBLIC_COGNITO_CLIENT_ID=30d70ue3s05jjgm0iqcjr7laq4
NEXT_PUBLIC_COGNITO_CLIENT_SECRET=aqpfa1kdjhkdltkq7ugecm2psq66afd4r532nkgs0gqd4io10fo
NEXT_PUBLIC_REGION=ap-south-1
NEXT_PUBLIC_ACCESS_KEY_ID=AKIASSQXBDQ5M6VLWDFT
NEXT_PUBLIC_SECRET_ACCESS_KEY=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
```

## Testing Deployed API

```bash
# Test auth endpoint (should return Unauthorized without token)
curl https://cyg01jt62k.execute-api.ap-south-1.amazonaws.com/dev/auth/current-user

# Test admin users endpoint
curl https://cyg01jt62k.execute-api.ap-south-1.amazonaws.com/dev/admin-users
```

## Monitoring

- **CloudWatch Logs**: `/aws/lambda/pi-admin-auth-dev` and `/aws/lambda/pi-admin-users-dev`
- **API Gateway**: Check request/response metrics in AWS Console
- **Frontend Logs**: Check browser console and deployment platform logs

## 🎉 Your app is now serverless and ready for production!