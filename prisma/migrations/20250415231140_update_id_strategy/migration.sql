/*
  Warnings:

  - The primary key for the `permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `role_permissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `roles` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `roleId` on the `role_permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `permissionId` on the `role_permissions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `roleId` on the `users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- Delete all existing data first
DELETE FROM "users";
DELETE FROM "role_permissions";
DELETE FROM "permissions";
DELETE FROM "roles";
DELETE FROM "companies";

-- Drop existing foreign key constraints
ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_permissionId_fkey";
ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_roleId_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_roleId_fkey";

-- Drop existing indexes
DROP INDEX IF EXISTS "users_roleId_idx";
DROP INDEX IF EXISTS "role_permissions_roleId_permissionId_key";
DROP INDEX IF EXISTS "permissions_name_key";
DROP INDEX IF EXISTS "roles_name_key";

-- Create temporary tables to store the data
CREATE TABLE "temp_permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "scope" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temp_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "temp_roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temp_roles_pkey" PRIMARY KEY ("id")
);

-- Copy data to temporary tables
INSERT INTO "temp_permissions" ("name", "displayName", "description", "scope", "isSystem", "createdAt", "updatedAt")
SELECT "name", "displayName", "description", "scope", "isSystem", "createdAt", "updatedAt"
FROM "permissions";

INSERT INTO "temp_roles" ("name", "displayName", "description", "isSystem", "createdAt", "updatedAt")
SELECT "name", "displayName", "description", "isSystem", "createdAt", "updatedAt"
FROM "roles";

-- Drop existing tables and recreate them with new schema
DROP TABLE IF EXISTS "role_permissions";
DROP TABLE IF EXISTS "permissions";
DROP TABLE IF EXISTS "roles";

-- Recreate tables with new schema
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "scope" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "role_permissions" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- Copy data back from temporary tables
INSERT INTO "permissions" ("id", "name", "displayName", "description", "scope", "isSystem", "createdAt", "updatedAt")
SELECT "id", "name", "displayName", "description", "scope", "isSystem", "createdAt", "updatedAt"
FROM "temp_permissions";

INSERT INTO "roles" ("id", "name", "displayName", "description", "isSystem", "createdAt", "updatedAt")
SELECT "id", "name", "displayName", "description", "isSystem", "createdAt", "updatedAt"
FROM "temp_roles";

-- Drop temporary tables
DROP TABLE "temp_permissions";
DROP TABLE "temp_roles";

-- Update users table
ALTER TABLE "users" ALTER COLUMN "roleId" TYPE INTEGER USING "roleId"::INTEGER;

-- Create indexes and constraints
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE UNIQUE INDEX "role_permissions_roleId_permissionId_key" ON "role_permissions"("roleId", "permissionId");
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- Add foreign key constraints
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
