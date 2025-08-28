/*
  Warnings:

  - You are about to drop the column `management_fees` on the `companies` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "companies" DROP COLUMN "management_fees",
ADD COLUMN     "management_max" DOUBLE PRECISION,
ADD COLUMN     "management_min" DOUBLE PRECISION;
