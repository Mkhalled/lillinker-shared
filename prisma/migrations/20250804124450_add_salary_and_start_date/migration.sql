-- AlterTable
ALTER TABLE "freelance_requests" ADD COLUMN     "salary" DOUBLE PRECISION,
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "want_salaried" BOOLEAN NOT NULL DEFAULT false;
