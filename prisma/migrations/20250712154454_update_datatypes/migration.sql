/*
  Warnings:

  - The values [BOOLEAN,DATE] on the enum `DataType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DataType_new" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'RADIO');
ALTER TABLE "platform_services" ALTER COLUMN "data_type" TYPE "DataType_new" USING ("data_type"::text::"DataType_new");
ALTER TYPE "DataType" RENAME TO "DataType_old";
ALTER TYPE "DataType_new" RENAME TO "DataType";
DROP TYPE "DataType_old";
COMMIT;
