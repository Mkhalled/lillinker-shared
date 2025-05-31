# Email Validation Process

This document outlines the email validation flow implemented in our application to verify user email addresses during account registration.

## Overview

When a user signs up, we send a verification email containing a unique token. The user must click the verification link to confirm their email address before their account is fully activated.

## Verification Flow

1. User registers with their email address
2. System generates a unique verification token and expiration time
3. Verification email is sent via NodeMailer
4. User clicks the link in the email
5. System validates the token and marks the email as verified

## Implementation

### Sending Verification Email

When a user registers, we:

1. Generate a random token (typically a UUID)
2. Set an expiration time 24h
3. Store the token and expiration in the user record
4. Send an email with a verification link containing the token

verification link api:
```
https://localhost:3000/api/auth/verify-email?token=abc123def456
```

### Email Validation Endpoint

The validation endpoint handles the verification process when a user clicks the link:

## Error Handling

The verification endpoint handles several error cases:

- **Missing Token**: If no token is provided in the URL
- **Invalid Token**: If the token doesn't match any user in the database
- **Expired Token**: If the token has passed its expiration time


## User Experience

After clicking the verification link, users should be redirected to a confirmation page indicating whether the verification was successful or if there was an error.
