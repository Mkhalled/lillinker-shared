/*
  Warnings:

  - A unique constraint covering the columns `[siret]` on the table `companies` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "siret" DROP NOT NULL,
ALTER COLUMN "siret" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "companies_siret_key" ON "companies"("siret");
