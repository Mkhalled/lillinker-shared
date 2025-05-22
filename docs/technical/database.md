# Database Setup and Seeding

## Prerequisites

Before running the seed script, ensure you have:

1. PostgreSQL database running
2. Environment variables set up in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/lillinker?schema=public"
   ```

## Database Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Generate Prisma client:

   ```bash
   pnpm prisma:generate
   ```

3. Run migrations:
   ```bash
   pnpm prisma:migrate
   ```

## Seeding the Database

The seed script creates sample data for testing and development:

### Sample Data Created

1. **Companies**:

   - TechCorp France (subsidiary)
   - TechCorp International (parent company)
   - Both companies have complete data including optional fields

2. **Users**:
   - Consultant (Jean Dupont)
   - Company Admin (Marie Martin)
   - Company Manager (Pierre Bernard)
   - Platform Admin (Admin System)
   - All users have verified emails and active accounts

### Running the Seed Script

```bash
# Run the seed script
pnpm prisma:seed
```

### Verifying the Data

You can view and verify the seeded data using Prisma Studio:

```bash
pnpm prisma:studio
```

### Resetting the Database

To reset the database and re-run the seed script:

```bash
# Reset the database
pnpm prisma:migrate reset
```

## Sample User Credentials

For testing purposes, all users have the password `password123` except the admin:

- **Consultant**: jean.dupont@example.com / password123
- **Company Admin**: marie.martin@techcorp.fr / password123
- **Company Manager**: pierre.bernard@techcorp.fr / password123
- **Platform Admin**: admin@lillinker.com / admin123

## Notes

- The seed script uses bcryptjs to hash passwords
- All sample users have verified emails and active accounts
- Company hierarchy is established between TechCorp France and TechCorp International
- All required fields are populated with realistic sample data
