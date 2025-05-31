# Authentication

This project uses a **custom-built authentication system**. Users register with the following fields:

- First Name
- Last Name
- Email
- Phone
- Password
- Role (`consultant` or `company-admin`)

Passwords are hashed using `bcryptjs`, and users must verify their email via a token system.

---

## 🧩 Registration Flow

1. Client sends a `POST` request to `/api/auth/register` with form data.
2. Input is validated using `validateUserRegistrationWithError`.
3. If valid:
   - Password is hashed
   - Email verification token is generated
   - User is stored with `isActive: false`, `emailVerified: false`
4. Returns `201 Created` with the new user (excluding password)

## 📧 Email Verification

After user registration, an email with a verification token is sent using Nodemailer:

1. A unique token is generated using `uuid` and stored with the user record
2. An email is composed with:
    - Verification link containing the token (`/verify-email?token=UUID`)

---

## 📁 Related Code

| File | Responsibility |
|------|----------------|
| `/api/auth/register-user` | Main API route to register users |
| `/services/auth.service.ts` | Handles database logic for creating users |
| `/validations/user.validation.ts` | Zod schema for input validation |
| `/lib/logger.ts` | Logging utility |
| `bcryptjs` | Password hashing |
| `uuid` | Token generation for email verification |

---

## ✅ Environment Requirements

Make sure the following are configured:

- Database connected via AuthService
- Logging is correctly set up (`lib/logger`)
- Mail service provider is included in .env file
---

## 🛡 Roles

- `consultant`
- `company-admin`