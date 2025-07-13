# Authentication API Testing Guide

## 1. Initial Registration
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "role": "COMPANY",
  "phone_number": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration initiated successfully",
  "userId": 1,
  "role": "COMPANY"
}
```

---

## 2A. Company Onboarding
**Endpoint:** `POST /api/auth/onboarding/company`

**Request Body:**
```json
{
  "userId": 1,
  "company_name": "Tech Solutions Inc",
  "company_description": "Leading technology consulting company",
  "siret": 12345678901234,
  "consultant_count": 25,
  "management_fees": 15.5,
  "service_label": "Software Development Consulting",
  "service_description": "Full-stack development services",
  "data_type": "SELECT",
  "requires_data": true,
  "data_label": "Technology Stack",
  "data_description": "Select your preferred technology stack",
  "choices": ["React/Node.js", "Vue/Laravel", "Angular/.NET", "Python/Django"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Company onboarding completed successfully",
  "data": {
    "company": {
      "id": 1,
      "admin_user_id": 1,
      "name": "Tech Solutions Inc",
      "siret": 12345678901234
    },
    "platformService": {
      "id": 1,
      "user_id": 1,
      "label": "Software Development Consulting",
      "status": "PENDING"
    },
    "companyService": {
      "id": 1,
      "company_id": 1,
      "service_id": 1,
      "is_active": false
    }
  }
}
```

---

## 2B. Freelance Onboarding
**Endpoint:** `POST /api/auth/onboarding/freelance`

**Request Body:**
```json
{
  "userId": 2,
  "metier": "Full Stack Developer",
  "mission_status": "OPEN",
  "client_name": "ABC Corporation",
  "client_address": "123 Business St, City, State",
  "client_sector": "Technology",
  "priority": "HIGH",
  "tjm": 650.00,
  "days": 20.0,
  "required_services": [1, 2]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Freelance onboarding completed successfully",
  "data": {
    "freelance": {
      "id": 1,
      "freelance_id": 2,
      "metier": "Full Stack Developer"
    },
    "freelanceRequest": {
      "id": 1,
      "freelance_id": 1,
      "mission_status": "OPEN",
      "tjm": 650.00,
      "days": 20.0
    },
    "requestOptions": [
      {
        "id": 1,
        "freelance_request_id": 1,
        "service_option_id": 1,
        "is_required": true
      },
      {
        "id": 2,
        "freelance_request_id": 1,
        "service_option_id": 2,
        "is_required": true
      }
    ]
  }
}
```

---

## 3. Get Available Services (for Freelance onboarding)
**Endpoint:** `GET /api/auth/services`

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "id": 1,
      "company_id": 1,
      "service_id": 1,
      "is_active": true,
      "service": {
        "id": 1,
        "label": "Software Development Consulting",
        "description": "Full-stack development services",
        "status": "ACTIVE"
      },
      "company": {
        "id": 1,
        "name": "Tech Solutions Inc"
      }
    }
  ]
}
```

---

## 4. Email Verification & Password Setting
**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**
```json
{
  "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified and password set successfully"
}
```

---

## 5. Login
**Endpoint:** `POST /api/auth/signin/credentials`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "csrfToken": "your-csrf-token"
}
```

**Response:**
```json
{
  "url": "/dashboard"
}
```

---

## Testing Flow

### For Company Registration:
1. **POST** `/api/auth/register` with company data
2. **POST** `/api/auth/onboarding/company` with company details
3. Check email for verification link
4. **POST** `/api/auth/verify-email` with token and password
5. **POST** `/api/auth/signin/credentials` to login

### For Freelance Registration:
1. **POST** `/api/auth/register` with freelance data
2. **GET** `/api/auth/services` to get available services (optional)
3. **POST** `/api/auth/onboarding/freelance` with freelance details
4. Check email for verification link
5. **POST** `/api/auth/verify-email` with token and password
6. **POST** `/api/auth/signin/credentials` to login

---

## Error Responses

**400 Bad Request:**
```json
{
  "error": "User with this email already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Environment Variables Required

```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="your-email@example.com"
```

---

## Database Setup

Make sure to run Prisma migrations:
```bash
npx prisma generate
npx prisma db push
``` 