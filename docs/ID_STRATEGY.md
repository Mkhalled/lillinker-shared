# ID Strategy Documentation

## Overview

This document outlines the ID strategy used in the Lillinker platform, explaining the rationale behind different ID types and their usage.

## ID Types

### 1. CUID (Collision-resistant Unique IDentifier)

**Used for:** Business-facing entities exposed via API
**Examples:** User, Company, SimulationRequest

**Benefits:**

- Globally unique across systems
- URL-safe and can be used directly in API endpoints
- Non-sequential, preventing enumeration attacks
- Can be generated on the client side
- No information about data volume is revealed

### 2. Auto-increment

**Used for:** Internal reference data
**Examples:** Role, Permission, Status

**Benefits:**

- Simpler to work with in code
- More efficient storage
- Easier to reference in internal operations
- Suitable for small, fixed sets of data

## Implementation Details

### Database Schema

The ID strategy is implemented in the Prisma schema:

```prisma
// Business-facing entities use cuid()
model User {
  id String @id @default(cuid())
  // ...
}

model Company {
  id String @id @default(cuid())
  // ...
}

// Internal reference data uses autoincrement()
model Role {
  id Int @id @default(autoincrement())
  // ...
}

model Permission {
  id Int @id @default(autoincrement())
  // ...
}
```

### Seed Data

The seed script (`prisma/seed.ts`) follows this strategy when creating initial data:

- Internal reference data (roles, permissions) use auto-increment IDs
- Business-facing entities (users, companies) use CUIDs

## Best Practices

1. **API Design**

   - Always use CUIDs in API endpoints
   - Never expose auto-increment IDs in public APIs
   - Use CUIDs in URLs and resource identifiers

2. **Database Operations**

   - Use appropriate ID types when creating new records
   - Consider ID type when designing relationships
   - Be consistent with ID types across related entities

3. **Security**
   - CUIDs provide better security for exposed entities
   - Auto-increment IDs are suitable for internal operations
   - Never expose internal reference data IDs in public APIs

## Migration Considerations

When migrating data:

1. Preserve existing CUIDs for business-facing entities
2. Recreate internal reference data with new auto-increment IDs
3. Update relationships to maintain data integrity
4. Test thoroughly to ensure all references are updated correctly
