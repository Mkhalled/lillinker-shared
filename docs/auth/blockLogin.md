/\*\*

- NextAuth Authentication Configuration
-
- This file configures the authentication process using NextAuth.js.
- It implements a security measure that prevents login for certain user accounts:
-
- User Access Restrictions:
- - Users with `isActive: false` cannot log in
- - Users with `emailVerified: null` cannot log in
-
- When these conditions are detected during login attempt, the system returns
- appropriate error messages to inform the user why access is denied.
-
- path: app/api/auth/[nextauth]
-
- Tests are available in tests/unit/auth/credentials.ts
- NextAuth configuration: src/lib/auth.ts
  \*/
