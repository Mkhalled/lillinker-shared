/*
  Warnings:

  - You are about to drop the column `metier` on the `freelances` table. All the data in the column will be lost.
  - Added the required column `metier_id` to the `freelances` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "metiers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "metiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "metiers_name_key" ON "metiers"("name");

-- Insert existing metier values into metiers table
INSERT INTO "metiers" ("name")
SELECT DISTINCT "metier" FROM "freelances" WHERE "metier" IS NOT NULL;

-- Add metier_id column as nullable first
ALTER TABLE "freelances" ADD COLUMN "metier_id" INTEGER;

-- Update metier_id based on existing metier values
UPDATE "freelances" 
SET "metier_id" = (
  SELECT "id" FROM "metiers" WHERE "name" = "freelances"."metier"
) 
WHERE "metier" IS NOT NULL;

-- Make metier_id required and drop old metier column
ALTER TABLE "freelances" ALTER COLUMN "metier_id" SET NOT NULL;
ALTER TABLE "freelances" DROP COLUMN "metier";

-- CreateTable
CREATE TABLE "company_metiers" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "metier_id" INTEGER NOT NULL,

    CONSTRAINT "company_metiers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_metiers_company_id_metier_id_key" ON "company_metiers"("company_id", "metier_id");

-- AddForeignKey
ALTER TABLE "freelances" ADD CONSTRAINT "freelances_metier_id_fkey" FOREIGN KEY ("metier_id") REFERENCES "metiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_metiers" ADD CONSTRAINT "company_metiers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_metiers" ADD CONSTRAINT "company_metiers_metier_id_fkey" FOREIGN KEY ("metier_id") REFERENCES "metiers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
