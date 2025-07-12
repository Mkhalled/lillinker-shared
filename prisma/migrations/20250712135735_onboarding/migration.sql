/*
  Warnings:

  - The primary key for the `companies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `capital` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `dateFondation` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationTokenExpiresAt` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `managementCosts` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `numberPorted` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `parentCompanyId` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `pseudonym` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `pseudonymGeneratedAt` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `companies` table. All the data in the column will be lost.
  - The `id` column on the `companies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `companyId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationTokenExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `firstname` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pseudonym` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pseudonymGeneratedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[admin_user_id]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `userId` on the `accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `admin_user_id` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consultant_count` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `management_fees` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `siret` on the `companies` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `first_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'COMPANY', 'FREELANCE', 'MANAGER');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'DATE');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('OPEN', 'CLOSED', 'PENDING');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_parentCompanyId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_companyId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_roleId_fkey";

-- DropIndex
DROP INDEX "companies_emailVerificationToken_key";

-- DropIndex
DROP INDEX "companies_email_key";

-- DropIndex
DROP INDEX "companies_parentCompanyId_idx";

-- DropIndex
DROP INDEX "companies_pseudonym_key";

-- DropIndex
DROP INDEX "companies_siret_key";

-- DropIndex
DROP INDEX "users_companyId_idx";

-- DropIndex
DROP INDEX "users_emailVerificationToken_key";

-- DropIndex
DROP INDEX "users_pseudonym_key";

-- DropIndex
DROP INDEX "users_roleId_idx";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "companies" DROP CONSTRAINT "companies_pkey",
DROP COLUMN "address",
DROP COLUMN "capital",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "createdAt",
DROP COLUMN "dateFondation",
DROP COLUMN "email",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "emailVerificationTokenExpiresAt",
DROP COLUMN "isActive",
DROP COLUMN "managementCosts",
DROP COLUMN "numberPorted",
DROP COLUMN "parentCompanyId",
DROP COLUMN "phone",
DROP COLUMN "postalCode",
DROP COLUMN "pseudonym",
DROP COLUMN "pseudonymGeneratedAt",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
ADD COLUMN     "admin_user_id" INTEGER NOT NULL,
ADD COLUMN     "consultant_count" INTEGER NOT NULL,
ADD COLUMN     "management_fees" DOUBLE PRECISION NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "siret",
ADD COLUMN     "siret" INTEGER NOT NULL,
ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "companyId",
DROP COLUMN "createdAt",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "emailVerificationTokenExpiresAt",
DROP COLUMN "emailVerified",
DROP COLUMN "firstname",
DROP COLUMN "isActive",
DROP COLUMN "lastname",
DROP COLUMN "phone",
DROP COLUMN "pseudonym",
DROP COLUMN "pseudonymGeneratedAt",
DROP COLUMN "roleId",
DROP COLUMN "updatedAt",
DROP COLUMN "username",
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "roles";

-- CreateTable
CREATE TABLE "freelances" (
    "id" SERIAL NOT NULL,
    "freelance_id" INTEGER NOT NULL,
    "metier" TEXT NOT NULL,

    CONSTRAINT "freelances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_managers" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "company_managers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_services" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "is_required" BOOLEAN NOT NULL,
    "data_type" "DataType" NOT NULL,
    "data_label" TEXT NOT NULL,
    "data_description" TEXT,
    "choices" JSONB,
    "status" "ServiceStatus" NOT NULL,

    CONSTRAINT "platform_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_services" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "service_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "company_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelance_requests" (
    "id" SERIAL NOT NULL,
    "freelance_id" INTEGER NOT NULL,
    "mission_status" "MissionStatus" NOT NULL,
    "client_name" TEXT NOT NULL,
    "client_address" TEXT NOT NULL,
    "client_sector" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "tjm" DOUBLE PRECISION NOT NULL,
    "days" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "freelance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelance_request_options" (
    "id" SERIAL NOT NULL,
    "freelance_request_id" INTEGER NOT NULL,
    "service_option_id" INTEGER NOT NULL,

    CONSTRAINT "freelance_request_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_responses" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "platform_service_id" INTEGER NOT NULL,
    "management_fees" DOUBLE PRECISION NOT NULL,
    "response_data" JSONB NOT NULL,

    CONSTRAINT "company_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "freelances_freelance_id_key" ON "freelances"("freelance_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_managers_company_id_user_id_key" ON "company_managers"("company_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_admin_user_id_key" ON "companies"("admin_user_id");

-- AddForeignKey
ALTER TABLE "freelances" ADD CONSTRAINT "freelances_freelance_id_fkey" FOREIGN KEY ("freelance_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_managers" ADD CONSTRAINT "company_managers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_managers" ADD CONSTRAINT "company_managers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_services" ADD CONSTRAINT "platform_services_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_services" ADD CONSTRAINT "company_services_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_services" ADD CONSTRAINT "company_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "platform_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelance_requests" ADD CONSTRAINT "freelance_requests_freelance_id_fkey" FOREIGN KEY ("freelance_id") REFERENCES "freelances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelance_request_options" ADD CONSTRAINT "freelance_request_options_freelance_request_id_fkey" FOREIGN KEY ("freelance_request_id") REFERENCES "freelance_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelance_request_options" ADD CONSTRAINT "freelance_request_options_service_option_id_fkey" FOREIGN KEY ("service_option_id") REFERENCES "company_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_responses" ADD CONSTRAINT "company_responses_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "freelance_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_responses" ADD CONSTRAINT "company_responses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_responses" ADD CONSTRAINT "company_responses_platform_service_id_fkey" FOREIGN KEY ("platform_service_id") REFERENCES "platform_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
