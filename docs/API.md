# API Documentation

## Authentication

### Register User

Registers a new user with the system. The registration process automatically handles different user roles (Consultant, Company Admin, Company Manager) based on the provided role.

**Endpoint:** `POST /api/auth/register-user`

#### Request Body

The request body varies based on the user role:

**Consultant:**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "password123",
  "phone": "+1234567890",
  "role": "CONSULTANT"
}
```

**Company Admin/Manager:**

```json
{
  "firstname": "Jane",
  "lastname": "Smith",
  "email": "jane.smith@company.com",
  "username": "janesmith",
  "password": "password123",
  "phone": "+1234567890",
  "role": "COMPANY_ADMIN", // or "COMPANY_MANAGER"
  "companyId": "company-123"
}
```

**Response:**

- Success (201):

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user-id",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "isActive": true,
    "emailVerified": false,
    "companyId": "company-123" // Only for COMPANY_ADMIN and COMPANY_MANAGER roles
  }
}
```

**Logging:**
The registration process includes comprehensive logging at key points:

- Start of registration process
- Input validation
- Role validation
- User creation
- Success/failure of registration

Logs include relevant context such as:

- User email
- Role type
- Company ID (for company roles)
- Error details (if applicable)

**Error Responses:**

- Validation Error (400):

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["firstname"],
      "message": "Expected string, received number"
    }
  ]
}
```

- User Exists (400):

```json
{
  "error": "User with this email or username already exists"
}
```

- Role Not Found (500):

```json
{
  "error": "Role CONSULTANT not found"
}
```

- Missing Company ID (400):

```json
{
  "error": "Company ID is required for company roles"
}
```

- Server Error (500):

```json
{
  "error": "An error occurred during registration"
}
```

**Notes:**

- The password is hashed before storage
- Email verification is required before the account becomes active
- Company roles (COMPANY_ADMIN, COMPANY_MANAGER) require a valid companyId
- All operations are logged for monitoring and debugging
- The system automatically handles role-specific requirements
