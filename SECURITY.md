# Security Documentation - Employee Credentials

## Overview
This document outlines the security measures and encryption methods used to protect employee credentials in the Pi Admin Dashboard system.

## Database Schema
The `employee_credentials` table stores user authentication data with the following structure:

```sql
CREATE TABLE employee_credentials (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Password Security

### Hashing Algorithm
- **Algorithm**: BCrypt (Blowfish-based)
- **Library**: `bcryptjs` v2.4.3
- **Salt Rounds**: 12 (provides strong protection against brute force attacks)
- **Hash Format**: Standard BCrypt format `$2a$12$[salt][hash]`

### Password Storage Process
1. **Plain Text Password** → User submits password during registration/login
2. **Salt Generation** → BCrypt automatically generates a unique salt for each password
3. **Hashing** → Password + salt are processed through BCrypt with 12 rounds
4. **Database Storage** → Only the hash is stored; original password is never saved

### Example Hash Structure
```
$2a$12$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUV
│  │  │                                                              │
│  │  └─ Salt (22 characters)                                        │
│  └─ Cost factor (12 rounds)                                        │
└─ Algorithm identifier ($2a$ = BCrypt)                              │
                                                                      └─ Hash (31 characters)
```

## Authentication Flow

### Login Process
1. User submits username and password
2. System retrieves stored hash from database
3. BCrypt compares submitted password with stored hash
4. If valid, JWT token is generated and returned
5. Invalid credentials result in authentication failure

### Password Verification
```javascript
// Verification process (simplified)
const isValid = await bcrypt.compare(plainTextPassword, storedHash);
```

## JWT Token Security

### Token Configuration
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret Key**: Stored in environment variables
- **Expiration**: 24 hours
- **Payload**: Contains user ID, username, email, role

### Token Structure
```json
{
  "userId": 1,
  "username": "admin",
  "email": "admin@company.com", 
  "role": "admin",
  "iat": 1756982245,
  "exp": 1757068645
}
```

## Additional Security Measures

### Company Secret Code
- **Purpose**: Additional protection layer for user creation and password reset
- **Value**: `pi-admin-secret-2025` (configurable via environment)
- **Usage**: Required for creating new users and resetting passwords
- **Storage**: Environment variable, not in database

### Environment Security
All sensitive configuration is stored in environment variables:
```env
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
JWT_SECRET=your-jwt-secret
COMPANY_SECRET=pi-admin-secret-2025
```

### Database Connection Security
- **SSL**: Enabled for production connections
- **Connection Pooling**: Limited concurrent connections
- **Prepared Statements**: Protection against SQL injection
- **Access Control**: Database user has minimal required permissions

## Security Best Practices Implemented

### Password Policy
- Minimum length requirements enforced on frontend
- Password confirmation required during registration
- Password visibility toggle for user convenience

### Session Management
- JWT tokens expire after 24 hours
- No server-side session storage (stateless authentication)
- Tokens must be included in Authorization header for protected routes

### Data Protection
- **No Plain Text Storage**: Passwords are never stored in plain text
- **Salt Uniqueness**: Each password gets a unique salt
- **Hash Irreversibility**: BCrypt hashes cannot be reversed to original passwords
- **Timing Attack Protection**: BCrypt comparison is constant-time

## Threat Mitigation

### Rainbow Table Attacks
- **Mitigation**: Unique salts for each password prevent rainbow table attacks
- **Salt Entropy**: BCrypt generates cryptographically secure random salts

### Brute Force Attacks
- **Mitigation**: 12 salt rounds make each hash computation expensive
- **Time Complexity**: ~100ms per hash verification (intentionally slow)

### Database Compromise
- **Impact**: Even if database is compromised, passwords remain protected
- **Recovery**: Attackers cannot reverse BCrypt hashes to obtain plain text passwords

## Compliance Considerations

### Data Protection
- Passwords are hashed immediately upon receipt
- No logging of sensitive authentication data
- Secure transmission over HTTPS (recommended for production)

### Access Logging
- Failed login attempts can be logged for monitoring
- Successful authentications generate audit trails
- Password changes are timestamped in database

## Recommendations for Production

1. **Enable HTTPS**: Ensure all communication is encrypted in transit
2. **Rate Limiting**: Implement login attempt rate limiting
3. **Account Lockout**: Consider temporary lockouts after failed attempts
4. **Password Rotation**: Implement password expiration policies if required
5. **Monitoring**: Set up alerts for suspicious authentication activity
6. **Backup Security**: Ensure database backups are also encrypted
7. **Key Rotation**: Regularly rotate JWT secrets and database credentials

## Technical Dependencies

### Core Security Libraries
- `bcryptjs`: ^2.4.3 - Password hashing
- `jsonwebtoken`: ^9.0.2 - JWT token handling
- `pg`: ^8.8.0 - PostgreSQL driver with prepared statements

### Development Notes
- Hash generation is CPU-intensive by design
- Consider caching strategies for high-traffic scenarios
- Monitor hash generation performance in production

---

**Last Updated**: September 4, 2025  
**Version**: 1.0  
**Maintainer**: Pi Admin Dashboard Team
