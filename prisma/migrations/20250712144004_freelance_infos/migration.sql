-- AlterTable
ALTER TABLE "freelance_requests" ALTER COLUMN "client_name" DROP NOT NULL,
ALTER COLUMN "client_address" DROP NOT NULL,
ALTER COLUMN "client_sector" DROP NOT NULL;
