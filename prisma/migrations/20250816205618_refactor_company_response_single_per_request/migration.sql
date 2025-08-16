/*
  Warnings:

  - You are about to drop the column `management_fees` on the `company_responses` table. All the data in the column will be lost.
  - You are about to drop the column `platform_service_id` on the `company_responses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[request_id,company_id]` on the table `company_responses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `company_responses` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Create a temporary table to store consolidated responses
CREATE TEMPORARY TABLE temp_consolidated_responses AS
SELECT 
    request_id,
    company_id,
    jsonb_agg(
        jsonb_build_object(
            'service_id', platform_service_id,
            'management_fees', management_fees,
            'response_data', response_data
        )
    ) as consolidated_response_data
FROM "company_responses" 
GROUP BY request_id, company_id;

-- Step 2: Delete all existing organisme relationships (will be recreated with new structure)
DELETE FROM "company_response_organismes";

-- Step 3: Delete all existing responses (will be replaced with consolidated ones)
DELETE FROM "company_responses";

-- Step 4: Drop the foreign key constraint
ALTER TABLE "company_responses" DROP CONSTRAINT "company_responses_platform_service_id_fkey";

-- Step 5: Modify the table structure
ALTER TABLE "company_responses" 
    DROP COLUMN "management_fees",
    DROP COLUMN "platform_service_id",
    ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 6: Insert consolidated responses
INSERT INTO "company_responses" (request_id, company_id, response_data, created_at, updated_at)
SELECT 
    request_id,
    company_id,
    consolidated_response_data,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM temp_consolidated_responses;

-- Step 7: Create the unique constraint
CREATE UNIQUE INDEX "company_responses_request_id_company_id_key" ON "company_responses"("request_id", "company_id");
