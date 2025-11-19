# Enhanced Authentication and Security Implementation Guide

## Overview
This implementation adds comprehensive authentication and security features including:
- Email verification
- OAuth2 login (Google & Microsoft)
- Password reset with 5-digit codes
- Username recovery
- Password history tracking (prevents reusing last 5 passwords)
- Profile management with secure email change
- Enhanced registration with validation

## 1. Database Migration

Run the SQL migration script to update your database:

```bash
mysql -u root -p userdb < microservices/user-service/add-security-features.sql
```

This will:
- Add new columns to `users` table (firstName, lastName, phoneNumber, emailVerified, etc.)
- Create `password_history` table
- Add necessary indexes
- Migrate existing data with default values

## 2. Email Configuration

### Option A: Gmail (Recommended for Development)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account > Security > 2-Step Verification > App passwords
   - Create a new app password for "Mail"
3. Update `application.properties`:

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-character-app-password
```

### Option B: Other Email Providers

Update these properties accordingly:
```properties
spring.mail.host=smtp.your-provider.com
spring.mail.port=587
spring.mail.username=your-email
spring.mail.password=your-password
```

## 3. OAuth2 Setup

### Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure OAuth consent screen:
   - Add test users for development
   - Set authorized redirect URI: `http://localhost:8081/login/oauth2/code/google`
6. Copy Client ID and Client Secret to `application.properties`:

```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
```

### Microsoft OAuth2

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations > New registration
3. Set redirect URI: `http://localhost:8081/login/oauth2/code/microsoft`
4. Go to Certificates & secrets > Create new client secret
5. Copy Application (client) ID and client secret:

```properties
spring.security.oauth2.client.registration.microsoft.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.microsoft.client-secret=YOUR_CLIENT_SECRET
```

## 4. Build and Run

```bash
cd microservices/user-service
mvn clean install
java -jar target/user-service-0.0.1-SNAPSHOT.jar
```

## 5. API Endpoints

### Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Email Verification
```http
GET /api/auth/verify-email?token={verification-token}
```
User receives this link via email. Token expires in 24 hours.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```
Sends a 5-digit code valid for 15 minutes.

### Reset Password
```http
POST /api/auth/reset-password?email=john@example.com
Content-Type: application/json

{
  "resetCode": "12345",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Security Features:**
- Cannot reuse current password
- Cannot reuse any of last 5 passwords
- Code expires in 15 minutes

### Forgot Username
```http
POST /api/auth/forgot-username
Content-Type: application/json

{
  "email": "john@example.com"
}
```
Sends username and verification code to email.

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "newEmail": "newemail@example.com",
  "newUsername": "johnnew"
}
```

**Email Change Process:**
1. Send new email in request
2. Verification email sent to new address
3. User clicks link to verify
4. Email updated after verification

## 6. Security Features Implemented

### Password Security
- ✅ Strong password validation (8+ chars, uppercase, lowercase, number, special char)
- ✅ Password confirmation requirement
- ✅ Password history tracking (last 5 passwords)
- ✅ Prevents password reuse
- ✅ Bcrypt encryption

### Email Security
- ✅ Email verification required
- ✅ Verification tokens with 24-hour expiry
- ✅ Email change requires re-verification
- ✅ Password reset via 5-digit code (15-minute expiry)
- ✅ Username recovery with verification

### Account Security
- ✅ Unique username validation
- ✅ Unique email validation
- ✅ JWT token authentication
- ✅ OAuth2 support (Google & Microsoft)
- ✅ Secure profile updates
- ✅ Prevents enumeration attacks (same response for valid/invalid emails)

### Data Validation
- ✅ Username: 3-20 chars, alphanumeric + underscore only
- ✅ Email: Valid format
- ✅ Phone: Optional, 10-15 digits
- ✅ First/Last Name: Required, 1-100 chars

## 7. Frontend Integration

### Registration Form Fields
```typescript
interface RegistrationForm {
  username: string;        // Required
  password: string;        // Required (strong)
  confirmPassword: string; // Required
  firstName: string;       // Required
  lastName: string;        // Required
  email: string;          // Required
  phoneNumber?: string;   // Optional
}
```

### OAuth2 Login Buttons
```html
<button onclick="window.location.href='/oauth2/authorization/google'">
  Sign in with Google
</button>

<button onclick="window.location.href='/oauth2/authorization/microsoft'">
  Sign in with Microsoft
</button>
```

## 8. Email Templates

All emails are sent with professional formatting:

1. **Email Verification**: Welcome email with 24-hour verification link
2. **Password Reset**: 5-digit code valid for 15 minutes
3. **Username Recovery**: Username + verification code
4. **Email Change**: New email verification link

## 9. Testing

### Test Registration
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#",
    "confirmPassword": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com"
  }'
```

### Test Login (After Email Verification)
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

## 10. Common Issues & Solutions

### Email Not Sending
- Check Gmail App Password is correct
- Verify 2FA is enabled on Gmail
- Check firewall allows outbound SMTP (port 587)
- Review application logs for detailed errors

### OAuth2 Not Working
- Verify redirect URIs match exactly
- Check client ID and secret are correct
- Ensure OAuth consent screen is configured
- Add test users in development mode

### Token Expired
- Email verification: Request new verification email
- Password reset: Request new reset code
- JWT: User needs to login again

## 11. Production Considerations

Before deploying to production:

1. **Change JWT Secret**: Use a strong, random secret key
2. **Use Production Email Service**: Consider SendGrid, AWS SES, or Mailgun
3. **Update Base URL**: Change `app.base-url` to your production domain
4. **Enable HTTPS**: All OAuth2 providers require HTTPS in production
5. **Environment Variables**: Store secrets in environment variables, not properties file
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **CAPTCHA**: Consider adding CAPTCHA to registration and password reset
8. **Email Queuing**: Use message queue for email sending at scale

## 12. Security Best Practices Applied

✅ **Input Validation**: All inputs validated with Jakarta Validation
✅ **SQL Injection Prevention**: JPA/Hibernate parameterized queries
✅ **XSS Prevention**: JSON serialization escapes special characters
✅ **CSRF Protection**: Included in Spring Security
✅ **Password Storage**: Bcrypt with salt
✅ **Token Expiry**: All tokens have expiration times
✅ **Email Enumeration Prevention**: Same response for valid/invalid emails
✅ **Password History**: Prevents password reuse
✅ **Account Lockout**: Can be added via Spring Security configuration
✅ **Audit Trail**: Timestamps on all user actions

## Need Help?

- Check logs: `microservices/user-service/logs/`
- Enable debug: `logging.level.com.storyapp.user=DEBUG`
- Test endpoints with Postman or curl
- Review Spring Security documentation for advanced configuration
