-- CreateTable
CREATE TABLE "company_response_organismes" (
    "id" SERIAL NOT NULL,
    "company_response_id" INTEGER NOT NULL,
    "organisme_id" INTEGER NOT NULL,
    "additional_data" JSONB,

    CONSTRAINT "company_response_organismes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "company_response_organismes" ADD CONSTRAINT "company_response_organismes_company_response_id_fkey" FOREIGN KEY ("company_response_id") REFERENCES "company_responses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_response_organismes" ADD CONSTRAINT "company_response_organismes_organisme_id_fkey" FOREIGN KEY ("organisme_id") REFERENCES "organismes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
