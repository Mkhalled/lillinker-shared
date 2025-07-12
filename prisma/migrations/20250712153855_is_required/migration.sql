/*
  Warnings:

  - You are about to drop the column `is_required` on the `platform_services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "freelance_request_options" ADD COLUMN     "is_required" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "platform_services" DROP COLUMN "is_required";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone_number" TEXT;
