# Pi Admin Dashboard - Authentication Setup

## Overview
This admin dashboard now includes a complete authentication system with the following features:

### Authentication Features
1. **Login System** - Username/password authentication
2. **User Creation** - Protected by company secret code
3. **Password Reset** - Protected by company secret code
4. **Protected Routes** - All dashboard routes require authentication
5. **JWT Token-based Authentication** - 24-hour session duration

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@company.com`

### Company Secret Code
The company secret code is required for:
- Creating new user accounts
- Resetting passwords

**Default Secret Code**: `pi-admin-secret-2025`

### Pages and Routes
- `/login` - Login page
- `/create-user` - User registration page (requires secret code)
- `/reset-password` - Password reset page (requires secret code)
- `/` - Protected dashboard (requires authentication)

### Security Features
1. **Password Requirements**: Minimum 8 characters
2. **Password Hashing**: BCrypt with 12 salt rounds
3. **JWT Tokens**: 24-hour expiration
4. **Company Secret Validation**: Required for sensitive operations
5. **Protected Routes**: Automatic redirect to login for unauthenticated users

### Environment Variables
You can set these in your `.env.local` file:
```
JWT_SECRET=your-jwt-secret-key-change-in-production
COMPANY_SECRET_CODE=your-company-secret-code
```

### Usage Instructions
1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. You'll be redirected to `/login`
4. Use the default credentials to login
5. Create additional users via `/create-user` using the secret code
6. Reset passwords via `/reset-password` using the secret code

### Production Notes
- Replace the in-memory user storage with a real database
- Use environment variables for secrets
- Set up proper email service for password reset notifications
- Configure secure JWT secrets
- Add rate limiting for authentication endpoints
- Add audit logging for authentication events

### File Structure
```
src/
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts
│   │   ├── create-user/route.ts
│   │   ├── request-reset/route.ts
│   │   └── reset-password/route.ts
│   ├── login/page.tsx
│   ├── create-user/page.tsx
│   └── reset-password/page.tsx
├── components/
│   ├── ProtectedRoute.tsx
│   └── DashboardLayout.tsx (updated with logout)
├── hooks/
│   └── useAuth.ts
└── lib/
    └── userDb.ts (shared user database)
```
