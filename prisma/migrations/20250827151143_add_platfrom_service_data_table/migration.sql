/*
  Warnings:

  - You are about to drop the column `choices` on the `platform_services` table. All the data in the column will be lost.
  - You are about to drop the column `data_description` on the `platform_services` table. All the data in the column will be lost.
  - You are about to drop the column `data_label` on the `platform_services` table. All the data in the column will be lost.
  - You are about to drop the column `data_type` on the `platform_services` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "platform_services" DROP COLUMN "choices",
DROP COLUMN "data_description",
DROP COLUMN "data_label",
DROP COLUMN "data_type";

-- CreateTable
CREATE TABLE "platform_service_data" (
    "id" SERIAL NOT NULL,
    "platformServiceId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "data_type" "DataType" NOT NULL,
    "choices" JSONB,

    CONSTRAINT "platform_service_data_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "platform_service_data" ADD CONSTRAINT "platform_service_data_platformServiceId_fkey" FOREIGN KEY ("platformServiceId") REFERENCES "platform_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
