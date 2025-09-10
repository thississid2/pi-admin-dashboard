# Pi Admin Dashboard

A modern, secure admin dashboard for merchant onboarding management with AWS Cognito authentication.

## 🏗️ Architecture

This application consists of two main components:

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS (Port 3000)
- **Backend**: Flask authentication service with AWS Cognito integration (Port 5001)

## 🚀 Features

- ✅ AWS Cognito OAuth2 authentication
- ✅ Merchant onboarding management
- ✅ Website legitimacy checker
- ✅ User management system
- ✅ Real-time dashboard analytics
- ✅ Secure session management
- ✅ Mobile-responsive design

## 📋 Prerequisites

- **Node.js** (v18 or later)
- **Python** (v3.8 or later)
- **AWS Account** with Cognito configured
- **Git**

## ⚙️ AWS Cognito Setup

### 1. Create User Pool

1. Go to AWS Cognito console
2. Create a new User Pool
3. Configure sign-in options:
   - Email address
   - Username (optional)
4. Set password policy as needed
5. Enable MFA if required

### 2. Create App Client

1. In your User Pool, go to "App integration"
2. Create an App Client:
   - **Client type**: Confidential client
   - **App client name**: `Pi-ClientAdmin`
   - **Generate client secret**: ✅ Yes
   - **Authentication flows**: Allow all
3. Note the **Client ID** and **Client Secret**

### 3. Configure Domain

1. Go to "App integration" → "Domain"
2. Choose either:
   - Cognito domain: `your-domain.auth.region.amazoncognito.com`
   - Custom domain: Your own domain
3. Note the full domain URL

### 4. Set Callback URLs

In your App Client settings:
- **Allowed callback URLs**: `http://localhost:5001/auth/authorize`
- **Allowed sign-out URLs**: `http://localhost:3000`
- **OAuth 2.0 grant types**: Authorization code grant
- **OAuth scopes**: `openid`, `email`, `profile`

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd pi-admin-dashboard
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

Configure `.env.local`:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

Configure `backend/.env`:
```bash
# Flask Configuration
FLASK_SECRET_KEY=your-super-secret-key-here
FLASK_DEBUG=True

# AWS Cognito Configuration
AWS_COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
AWS_COGNITO_CLIENT_ID=your-client-id
AWS_COGNITO_CLIENT_SECRET=your-client-secret
AWS_COGNITO_REGION=ap-south-1
AWS_COGNITO_DOMAIN=https://your-domain.auth.ap-south-1.amazoncognito.com

# Frontend URLs
FRONTEND_URL=http://localhost:3000
FRONTEND_CALLBACK_URL=http://localhost:3000/auth/callback

# CORS Configuration
CORS_ORIGINS=http://localhost:3000

# Session Configuration
SESSION_COOKIE_SECURE=False
SESSION_COOKIE_HTTPONLY=True
SESSION_COOKIE_SAMESITE=Lax
```

## 🚀 Running the Application

### Quick Setup (Recommended)

Use the automated setup script:

```bash
# Check prerequisites and setup environment
./dev-setup.sh
```

### Development Mode

**Terminal 1 - Backend Service:**
```bash
cd backend
source venv/bin/activate  # or venv\\Scripts\\activate on Windows
python app.py
```

**Terminal 2 - Frontend Application:**
```bash
npm run dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

### Production Mode

**Frontend:**
```bash
npm run build
npm start
```

**Backend:**
```bash
cd backend
source venv/bin/activate
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## 🧪 Testing

### Automated Testing

Use the test script to verify your setup:

```bash
# Run comprehensive authentication tests
./test-auth.sh
```

### Manual Testing

#### Health Check

Test if services are running:

```bash
# Frontend health (should return 200)
curl http://localhost:3000

# Backend health check
curl http://localhost:5001/health
```

Expected backend response:
```json
{
  "status": "healthy",
  "service": "pi-admin-auth-backend",
  "cognito_configured": true
}
```

### Authentication Flow Testing

1. **Start both services** (frontend and backend)

2. **Test login flow:**
   ```bash
   # This should redirect to Cognito login
   curl -v http://localhost:5001/auth/login
   ```

3. **Manual authentication test:**
   - Open browser: http://localhost:3000
   - Click "Login" - should redirect to Cognito
   - Login with your Cognito user
   - Should redirect back to dashboard

4. **Test authentication status:**
   ```bash
   # Should return authentication status
   curl -b cookies.txt -c cookies.txt http://localhost:5001/auth/status
   ```

### API Endpoints Testing

```bash
# Health check
curl http://localhost:5001/health

# Authentication status
curl -b cookies.txt http://localhost:5001/auth/status

# User info (requires authentication)
curl -b cookies.txt http://localhost:5001/auth/user

# Logout
curl -b cookies.txt http://localhost:5001/auth/logout
```

## 🔧 Configuration Details

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_COGNITO_USER_POOL_ID` | Your Cognito User Pool ID | `ap-south-1_NK3qZ5B7u` |
| `AWS_COGNITO_CLIENT_ID` | Your App Client ID | `abc123def456` |
| `AWS_COGNITO_CLIENT_SECRET` | Your App Client Secret | `secret123` |
| `AWS_COGNITO_REGION` | AWS region | `ap-south-1` |
| `AWS_COGNITO_DOMAIN` | Full Cognito domain URL | `https://your-domain.auth.region.amazoncognito.com` |
| `FRONTEND_URL` | Frontend base URL | `http://localhost:3000` |
| `FRONTEND_CALLBACK_URL` | OAuth callback URL | `http://localhost:3000/auth/callback` |

### Session Configuration

- **SESSION_COOKIE_SECURE**: Set to `True` in production with HTTPS
- **SESSION_COOKIE_HTTPONLY**: Prevents XSS attacks
- **SESSION_COOKIE_SAMESITE**: CSRF protection

## 🚨 Troubleshooting

### Common Issues

#### 1. "Session cookie too large" Warning

**Symptom**: Authentication works but shows cookie size warning
**Solution**: The system automatically minimizes session data. Warning is informational only.

#### 2. Infinite API Calls

**Symptom**: Continuous `/auth/status` requests in logs
**Solution**: Ensure no duplicate authentication hooks are running.

#### 3. CORS Errors

**Symptom**: `Access-Control-Allow-Origin` errors
**Solution**: Verify `CORS_ORIGINS` includes your frontend URL.

#### 4. "Invalid client" Error

**Symptom**: OAuth errors during login
**Solution**: 
- Verify client secret is correct
- Check callback URLs match exactly
- Ensure client type is "Confidential"

#### 5. Port Conflicts

**Symptom**: "Address already in use" on port 5001
**Solution**: 
```bash
# Find and kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

### Debug Mode

Enable detailed logging:

```bash
# Backend debug mode (already enabled in development)
export FLASK_DEBUG=True

# Frontend debug mode
export NODE_ENV=development
```

### Logs Location

- **Frontend logs**: Browser console and terminal
- **Backend logs**: Terminal output where Flask is running

## 📁 Project Structure

```
pi-admin-dashboard/
├── backend/                 # Flask authentication service
│   ├── app.py              # Main Flask application
│   ├── auth_utils.py       # Authentication utilities
│   ├── config.py           # Configuration management
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Backend environment variables
│   ├── .env.example       # Backend environment template
│   └── venv/              # Python virtual environment
├── src/                    # Next.js frontend source
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility libraries
├── public/                # Static assets
├── dev-setup.sh           # Development setup script
├── test-auth.sh           # Authentication testing script
├── package.json           # Node.js dependencies
├── .env.local            # Frontend environment variables
├── .env.local.example    # Frontend environment template
└── README.md             # This file
```

## 🔐 Security Considerations

- ✅ Session cookies are HTTP-only and secure
- ✅ CSRF protection via SameSite cookies
- ✅ OAuth2 with PKCE flow
- ✅ JWT token validation
- ✅ Environment variable isolation
- ✅ CORS protection

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the application: `npm run build`
2. Deploy the `out` folder
3. Configure environment variables

### Backend (AWS/Heroku/DigitalOcean)

1. Install dependencies: `pip install -r requirements.txt`
2. Configure production environment variables
3. Use production WSGI server: `gunicorn app:app`
4. Enable HTTPS and update cookie settings

## 📝 API Documentation

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/auth/login` | GET | Initiate OAuth login |
| `/auth/authorize` | GET | OAuth callback handler |
| `/auth/status` | GET | Check authentication status |
| `/auth/user` | GET | Get current user info |
| `/auth/refresh` | POST | Refresh authentication |
| `/auth/logout` | GET | Logout and clear session |

### Response Formats

**Health Check:**
```json
{
  "status": "healthy",
  "service": "pi-admin-auth-backend",
  "cognito_configured": true
}
```

**Auth Status:**
```json
{
  "authenticated": true,
  "user": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token_expires_at": 1696969200
}
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the configuration settings
3. Verify AWS Cognito setup
4. Check application logs

## 📄 License

This project is for internal use only.
