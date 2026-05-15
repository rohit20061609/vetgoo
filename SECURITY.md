# VetGo Security Guidelines

## Overview

This document outlines the security hardening measures implemented in VetGo and provides guidelines for maintaining security throughout development.

## Authentication & Authorization

### NextAuth.js Configuration

- **Session Strategy**: JWT with 30-day expiration
- **Providers**:
  - Google OAuth (account linking disabled to prevent attacks)
  - Email OTP (requires implementation)
- **Secure Cookies**:
  - `__Secure-next-auth.session-token`: HttpOnly, SameSite=Lax
  - HTTPS-only in production (`NODE_ENV=production`)
  - All cookies use `Secure` flag in production

### Password Security

- Passwords are hashed using bcryptjs with 10 salt rounds
- Minimum password length: 8 characters
- Maximum password length: 128 characters
- Passwords are stored in the `User.password` field (only for email/password auth)

### Email/OTP Authentication

**Status**: TODO - Currently returns false to prevent unauthorized access

To implement OTP:
1. Set up a cache layer (Redis, Memcached) or database table for OTP storage
2. Generate 6-digit OTP valid for 5-10 minutes
3. Store OTP with email as key
4. Verify OTP matches and hasn't expired
5. Delete OTP after successful verification (one-time use)

## API Security

### Input Validation

All API endpoints validate input using Zod schemas defined in `lib/schemas.ts`:

- **Pet data**: Name (1-100 chars), Type (enum), Breed, Age, Weight, Color, Microchip ID, Image URL
- **Appointments**: Pet ID, Title (1-200 chars), Type (enum), Date/Time, Duration (15-480 min), Notes
- **User profile**: Name (1-100 chars), Phone (valid format), Address, City, State, ZIP, Country
- **Chat messages**: 1-4000 characters, conversation ID optional
- **Triage queries**: Similar to chat, with species and history
- **Nearby vets**: Latitude/Longitude (required), Radius (1-500 km, default 25)

### Authorization

All protected endpoints check:
1. User authentication via `getServerSession()`
2. Email verification
3. User existence
4. Resource ownership (e.g., pet belongs to authenticated user)

Example: Appointment creation verifies the pet belongs to the authenticated user.

### Payment Security

**Payment Creation** (`/api/payments/create`):
- Verifies appointment belongs to authenticated user
- Computes amount server-side (doesn't trust client)
- Standard consultation price: ₹5.00 (500 paise)
- User ownership check prevents unauthorized appointments from being paid for

**Payment Webhook** (`/api/payments/webhook`):
- Verifies Stripe webhook signature
- Implements idempotency (checks for duplicate payments)
- Validates metadata structure
- Strict amount and currency validation
- Only updates payment/appointment status after all validations pass

### Data Exposure Mitigation

**User Profile Endpoint**:
- Returns only: ID, name, email, phone, image, userType, profile fields
- Excludes: password, sessions, internal IDs

**Nearby Vets Endpoint**:
- Returns public-facing vet information
- Excludes: Email (PII) unless explicitly needed
- Includes: License number, specialization, experience, bio, location

## Platform Security

### Security Headers (via Middleware)

All responses include:

- **X-Frame-Options**: DENY (prevents clickjacking)
- **X-Content-Type-Options**: nosniff (prevents MIME sniffing)
- **X-XSS-Protection**: 1; mode=block (legacy XSS protection)
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restricts geolocation, microphone, camera, payment APIs
- **Strict-Transport-Security**: max-age=31536000 (production only)
- **Content-Security-Policy**: Restrictive policy to prevent XSS and injection attacks

### Image Handling

`next.config.js` restricts remote image sources to approved domains:
- Google OAuth profile pictures (lh3.googleusercontent.com)
- Uploadthing CDN
- Add more as needed

**Before**: `hostname: '**'` (wildcard - security risk)
**After**: Explicit domain allowlist

## Environment Variables

### Required in Production

```env
# Database - Use strong credentials
DATABASE_URL="postgresql://user:strong_password@host/database"

# NextAuth.js - MUST be 32+ characters, cryptographically random
NEXTAUTH_SECRET="generate-with-openssl-rand-hex-32"
NEXTAUTH_URL="https://yourdomain.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Stripe - Use production keys
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# APIs
ANTHROPIC_API_KEY="your-api-key"
UPLOADTHING_SECRET="your-secret"
UPLOADTHING_APP_ID="your-app-id"
RESEND_API_KEY="your-api-key"

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

### Generating NEXTAUTH_SECRET

```bash
openssl rand -hex 32
```

### Security Best Practices

1. **Never commit secrets** - Use `.env.local` (gitignored) for development
2. **Use strong credentials** - Complex passwords for database users
3. **Rotate secrets regularly** - Especially API keys and webhook secrets
4. **Use least privilege** - Database user should only have necessary permissions
5. **HTTPS only** - Production must use HTTPS
6. **Secure storage** - Use platform secrets management (GitHub Secrets, Vercel, Railway, etc.)

## Dependency Security

### Vulnerabilities

Known vulnerabilities in dependencies (as of latest audit):
- `next` (14.1.0): DoS issues with Image Optimizer, Server Components, Middleware
- `glob`: Command injection in CLI
- `postcss`: XSS in CSS stringify

### Keeping Dependencies Secure

1. **Regular audits**: `npm audit` before deployment
2. **Automated scanning**: GitHub Dependabot or npm audit in CI/CD
3. **Keep updated**: Run `npm update` regularly
4. **Review changes**: Check changelog before major version upgrades

## Operational Security

### Error Logging

- Don't log sensitive data (passwords, API keys, tokens, PII)
- Use `error?.message` instead of full error objects in logs
- Sanitize user inputs before logging

### CORS Configuration

Current setup: NextAuth handles CORS for auth endpoints. For other APIs:
- Same-origin requests only
- Add explicit allowed origins if needed

### Rate Limiting

**TODO**: Implement rate limiting for:
- Auth endpoints (`/api/auth/register`, sign in)
- AI endpoints (`/api/chat/stream`, `/api/triage`)
- Payment endpoints (`/api/payments/create`)

Recommended: Use middleware like `next-rate-limit` or external service.

## Testing Security

### Before Deployment

1. **Input validation**: Test with invalid/malicious inputs
2. **Authorization**: Verify users can only access their own data
3. **Authentication**: Confirm protected routes require auth
4. **Payment flows**: Test with Stripe test keys
5. **Error handling**: Ensure errors don't leak sensitive info

### Security Testing Tools

- OWASP ZAP: Automated security scanning
- Burp Suite Community: Web app vulnerability scanning
- npm audit: Dependency vulnerability checking

## Incident Response

### If a Breach is Suspected

1. **Rotate credentials immediately**:
   - NEXTAUTH_SECRET
   - Database credentials
   - API keys
   - Webhook secrets

2. **Review logs** for unauthorized access

3. **Notify affected users** if PII was compromised

4. **Update security measures** to prevent recurrence

## Compliance & Standards

- **OWASP Top 10**: Mitigations for SQLi, XSS, CSRF, insecure auth, etc.
- **GDPR**: Ensure data handling complies with privacy regulations
- **Data retention**: Define and implement data deletion policies

## References

- [OWASP Security Best Practices](https://owasp.org)
- [NextAuth.js Security](https://next-auth.js.org/getting-started/example)
- [Stripe Security](https://stripe.com/docs/security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Security Contacts

Report security vulnerabilities responsibly:
- Email: security@vetgoo.in (when set up)
- Do not open public issues for security vulnerabilities

---

**Last Updated**: 2026-05-15
**Status**: Security hardening completed for core vulnerabilities
