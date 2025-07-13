# Authentication API Testing Guide

## 1. Initial Registration
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "first_name": "Marie",
  "last_name": "Dubois",
  "email": "marie.dubois@portagesalarial.fr",
  "role": "COMPANY",
  "phone_number": "+33123456789"
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

## 2A. Company Onboarding (Société de Portage Salarial)
**Endpoint:** `POST /api/auth/onboarding/company`

**Request Body:**
```json
{
  "userId": 1,
  "company_name": "Portage Solutions Pro",
  "company_description": "Société de portage salarial spécialisée dans l'accompagnement des freelances IT",
  "siret": 12345678901234,
  "consultant_count": 150,
  "management_fees": 8.5,
  "service_label": "Portage Salarial IT & Digital",
  "service_description": "Services de portage salarial pour freelances du secteur numérique avec accompagnement personnalisé",
  "data_type": "SELECT",
  "requires_data": true,
  "data_label": "Spécialisation Métier",
  "data_description": "Sélectionnez votre domaine d'expertise principal",
  "choices": ["Développement Web", "Data Science", "DevOps", "Cybersécurité", "UX/UI Design", "Gestion de Projet IT"]
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
      "name": "Portage Solutions Pro",
      "siret": 12345678901234
    },
    "platformService": {
      "id": 1,
      "user_id": 1,
      "label": "Portage Salarial IT & Digital",
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
  "metier": "Développeur Full Stack",
  "mission_status": "OPEN",
  "client_name": "Banque Digitale Solutions",
  "client_address": "15 Avenue des Champs-Élysées, 75008 Paris",
  "client_sector": "Services Financiers",
  "priority": "HIGH",
  "tjm": 550.00,
  "days": 25.0,
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
      "metier": "Développeur Full Stack"
    },
    "freelanceRequest": {
      "id": 1,
      "freelance_id": 1,
      "mission_status": "OPEN",
      "tjm": 550.00,
      "days": 25.0
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

## 3. Get Available Services (pour l'onboarding Freelance)
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
        "label": "Portage Salarial IT & Digital",
        "description": "Services de portage salarial pour freelances du secteur numérique",
        "status": "ACTIVE"
      },
      "company": {
        "id": 1,
        "name": "Portage Solutions Pro"
      }
    },
    {
      "id": 2,
      "company_id": 2,
      "service_id": 2,
      "is_active": true,
      "service": {
        "id": 2,
        "label": "Portage Premium Consultants",
        "description": "Accompagnement haut de gamme pour consultants seniors",
        "status": "ACTIVE"
      },
      "company": {
        "id": 2,
        "name": "Lillinker Portage Elite"
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
  "password": "Portage2024!",
  "confirmPassword": "Portage2024!"
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
  "email": "marie.dubois@portagesalarial.fr",
  "password": "Portage2024!",
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

### Pour l'inscription Société de Portage:
1. **POST** `/api/auth/register` avec les données de la société
2. **POST** `/api/auth/onboarding/company` avec les détails de la société de portage
3. Vérifier l'email pour le lien de vérification
4. **POST** `/api/auth/verify-email` avec le token et mot de passe
5. **POST** `/api/auth/signin/credentials` pour se connecter

### Pour l'inscription Freelance:
1. **POST** `/api/auth/register` avec les données freelance
2. **GET** `/api/auth/services` pour obtenir les services disponibles (optionnel)
3. **POST** `/api/auth/onboarding/freelance` avec les détails de mission
4. Vérifier l'email pour le lien de vérification
5. **POST** `/api/auth/verify-email` avec le token et mot de passe
6. **POST** `/api/auth/signin/credentials` pour se connecter

---

## Error Responses

**400 Bad Request:**
```json
{
  "error": "Un utilisateur avec cet email existe déjà"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Erreur serveur interne"
}
```

---

## Environment Variables Required

```env
DATABASE_URL="postgresql://username:password@localhost:5432/lillinker_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="lillinker-secret-key-2024"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="noreply@lillinker.fr"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@lillinker.fr"
```

---

## Database Setup

Make sure to run Prisma migrations:
```bash
npx prisma generate
npx prisma db push
``` 