# Database Setup

## Overview

This document outlines the database setup and configuration for the Lillinker Platform. We use PostgreSQL as our primary database, managed through Prisma ORM.

## Requirements

- PostgreSQL 14 or higher
- Docker (optional, for containerized setup)
- Prisma CLI
- Node.js 18 or higher

## Setup Options

### 1. Local PostgreSQL Installation

1. Install PostgreSQL:

   ```bash
   # macOS
   brew install postgresql@14

   # Ubuntu
   sudo apt-get update
   sudo apt-get install postgresql-14
   ```

2. Start PostgreSQL service:

   ```bash
   # macOS
   brew services start postgresql@14

   # Ubuntu
   sudo service postgresql start
   ```

3. Create database and user:

   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database
   CREATE DATABASE lillinker;

   # Create user
   CREATE USER lillinker WITH PASSWORD 'your_password';

   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE lillinker TO lillinker;
   ```

### 2. Docker Setup

1. Create `docker-compose.yml`:

   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:14
       container_name: lillinker-db
       environment:
         POSTGRES_USER: lillinker
         POSTGRES_PASSWORD: your_password
         POSTGRES_DB: lillinker
       ports:
         - '5432:5432'
       volumes:
         - postgres_data:/var/lib/postgresql/data
       healthcheck:
         test: ['CMD-SHELL', 'pg_isready -U lillinker']
         interval: 5s
         timeout: 5s
         retries: 5

   volumes:
     postgres_data:
   ```

2. Start the container:
   ```bash
   docker-compose up -d
   ```

## Configuration

### Environment Variables

Create `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://lillinker:your_password@localhost:5432/lillinker?schema=public"

# Test Database
TEST_DATABASE_URL="postgresql://lillinker:your_password@localhost:5432/lillinker_test?schema=public"
```

### Prisma Setup

1. Initialize Prisma:

   ```bash
   npx prisma init
   ```

2. Generate Prisma Client:

   ```bash
   npx prisma generate
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

## Database Management

### Migrations

1. Create a new migration:

   ```bash
   npx prisma migrate dev --name <migration_name>
   ```

2. Apply migrations to production:
   ```bash
   npx prisma migrate deploy
   ```

### Seeding

1. Create seed script in `prisma/seed.ts`:

   ```typescript
   import { PrismaClient } from '@prisma/client';

   const prisma = new PrismaClient();

   async function main() {
     // Seed data here
   }

   main()
     .catch(e => {
       console.error(e);
       process.exit(1);
     })
     .finally(async () => {
       await prisma.$disconnect();
     });
   ```

2. Add seed script to `package.json`:

   ```json
   {
     "prisma": {
       "seed": "ts-node prisma/seed.ts"
     }
   }
   ```

3. Run seed:
   ```bash
   npx prisma db seed
   ```

## Testing Setup

1. Create test database:

   ```bash
   createdb lillinker_test
   ```

2. Run migrations for test database:

   ```bash
   DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy
   ```

3. Configure test environment:

   ```typescript
   // tests/helpers/prisma.ts
   import { PrismaClient } from '@prisma/client';

   export const prisma = new PrismaClient();

   export const cleanupDatabase = async () => {
     const tables = await prisma.$queryRaw<
       Array<{ tablename: string }>
     >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

     for (const { tablename } of tables) {
       if (tablename !== '_prisma_migrations') {
         await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
       }
     }
   };
   ```

## Backup and Recovery

### Backup

```bash
# Create backup
pg_dump -U lillinker -d lillinker > backup.sql

# Create backup with custom format
pg_dump -U lillinker -d lillinker -F c > backup.dump
```

### Restore

```bash
# Restore from SQL file
psql -U lillinker -d lillinker < backup.sql

# Restore from custom format
pg_restore -U lillinker -d lillinker backup.dump
```

## Monitoring

### Basic Monitoring

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT
    relname as "Table",
    pg_size_pretty(pg_total_relation_size(relid)) As "Size",
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as "External Size"
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### Performance Tuning

1. Update `postgresql.conf`:

   ```conf
   # Memory
   shared_buffers = 128MB
   work_mem = 4MB
   maintenance_work_mem = 64MB

   # Write Ahead Log
   wal_buffers = 16MB
   checkpoint_completion_target = 0.9

   # Query Planner
   random_page_cost = 1.1
   effective_cache_size = 1GB
   ```

2. Create indexes for frequently queried fields:
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_companies_siret ON companies(siret);
   ```

````

## Troubleshooting

### Common Issues

1. **Connection Issues**

   - Verify database URL
   - Check PostgreSQL service status
   - Ensure correct credentials

2. **Migration Problems**

   - Check for conflicting migrations
   - Verify database permissions
   - Review migration history

3. **Performance Issues**
   - Review query patterns
   - Check index usage
   - Monitor connection pool

### Debugging

```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
````

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
