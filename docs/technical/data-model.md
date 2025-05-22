# Data Models

## Overview

This document describes the core data models used in the Lillinker Platform. The models are implemented using Prisma and follow a relational database structure.

## Core Models

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  firstname     String
  lastname      String
  username      String    @unique
  email         String    @unique
  password      String
  phone         String?
  isActive      Boolean   @default(false)
  roleId        Int
  role          Role      @relation(fields: [roleId], references: [id])
  emailVerified Boolean   @default(false)

  // NextAuth fields
  image         String?
  accounts      Account[]
  sessions      Session[]

  // Pseudonym fields
  pseudonym     String?   @unique
  pseudonymGeneratedAt DateTime?

  // Email verification
  emailVerificationToken String?   @unique
  emailVerificationTokenExpiresAt DateTime?

  // Relations
  companyId     String?
  company       Company?  @relation(fields: [companyId], references: [id])

  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([companyId])
  @@index([roleId])
  @@map("users")
}
```

### Role Model

```prisma
model Role {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  displayName String
  description String?
  isSystem    Boolean   @default(false)
  users       User[]
  permissions RolePermission[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("roles")
}
```

### Permission Model

```prisma
model Permission {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  displayName String
  description String?
  scope       String?
  isSystem    Boolean   @default(false)
  roles       RolePermission[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("permissions")
}
```

### Role-Permission Junction Model

```prisma
model RolePermission {
  id           Int       @id @default(autoincrement())
  roleId       Int
  role         Role      @relation(fields: [roleId], references: [id])
  permissionId Int
  permission   Permission @relation(fields: [permissionId], references: [id])
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@unique([roleId, permissionId])
  @@map("role_permissions")
}
```

### Company Model

```prisma
model Company {
  id              String    @id @default(cuid())
  name            String
  siret           String    @unique
  type            String
  description     String?
  dateFondation   DateTime
  capital         Float
  logo            String?
  isActive        Boolean   @default(false)

  // Pseudonym fields
  pseudonym       String?   @unique
  pseudonymGeneratedAt DateTime?

  // Email verification
  emailVerificationToken String?   @unique
  emailVerificationTokenExpiresAt DateTime?

  // Address information
  address         String
  city            String
  postalCode      String
  country         String

  // Contact information
  phone           String
  email           String    @unique

  // Business metrics
  managementCosts Float
  numberPorted    Int

  // Company hierarchy
  parentCompanyId String?
  parentCompany   Company?  @relation("CompanyHierarchy", fields: [parentCompanyId], references: [id])
  subsidiaries    Company[] @relation("CompanyHierarchy")

  // Relations
  users           User[]

  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([parentCompanyId])
  @@map("companies")
}
```

## NextAuth Models

### Account Model

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?  @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}
```

### Session Model

```prisma
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

## Key Features

1. **User Management**

   - Email/password authentication
   - Role-based access control
   - Email verification
   - Pseudonym support for consultants

2. **Role-Based Access Control**

   - Hierarchical role system
   - Permission-based access
   - Role-permission mapping
   - System-defined roles and permissions

3. **Company Management**

   - Company hierarchy support
   - Business metrics tracking
   - Address and contact management
   - Pseudonym support for anonymous interactions

4. **Security**
   - Password hashing
   - Email verification tokens
   - Session management
   - OAuth integration

## Indexes

- User: `companyId`, `roleId`
- Company: `parentCompanyId`
- Account: `[provider, providerAccountId]`
- Session: `sessionToken`
- RolePermission: `[roleId, permissionId]`

## Relations

1. **User Relations**

   - One-to-many with Role
   - One-to-many with Company
   - One-to-many with Account
   - One-to-many with Session

2. **Company Relations**

   - One-to-many with User
   - Self-referential for hierarchy
   - One-to-many with subsidiaries

3. **Role Relations**

   - One-to-many with User
   - Many-to-many with Permission

4. **Permission Relations**
   - Many-to-many with Role

## Constraints

1. **Unique Constraints**

   - User: `email`, `username`, `pseudonym`
   - Company: `siret`, `email`, `pseudonym`
   - Role: `name`
   - Permission: `name`
   - Account: `[provider, providerAccountId]`
   - Session: `sessionToken`

2. **Required Fields**
   - User: `firstname`, `lastname`, `username`, `email`, `password`, `roleId`
   - Company: `name`, `siret`, `type`, `dateFondation`, `capital`, `address`, `city`, `postalCode`, `country`, `phone`, `email`
   - Role: `name`, `displayName`
   - Permission: `name`, `displayName`

## Timestamps

All models include:

- `createdAt`: Set on creation
- `updatedAt`: Updated on modification
