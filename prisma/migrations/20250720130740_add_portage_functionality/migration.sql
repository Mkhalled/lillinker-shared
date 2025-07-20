-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "is_portage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "freelance_requests" ADD COLUMN     "wants_portage" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "company_portages" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "portage_id" INTEGER NOT NULL,

    CONSTRAINT "company_portages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "freelance_request_portages" (
    "id" SERIAL NOT NULL,
    "freelance_request_id" INTEGER NOT NULL,
    "portage_id" INTEGER NOT NULL,

    CONSTRAINT "freelance_request_portages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "portages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_portages_company_id_portage_id_key" ON "company_portages"("company_id", "portage_id");

-- CreateIndex
CREATE UNIQUE INDEX "freelance_request_portages_freelance_request_id_portage_id_key" ON "freelance_request_portages"("freelance_request_id", "portage_id");

-- CreateIndex
CREATE UNIQUE INDEX "portages_name_key" ON "portages"("name");

-- AddForeignKey
ALTER TABLE "company_portages" ADD CONSTRAINT "company_portages_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_portages" ADD CONSTRAINT "company_portages_portage_id_fkey" FOREIGN KEY ("portage_id") REFERENCES "portages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelance_request_portages" ADD CONSTRAINT "freelance_request_portages_freelance_request_id_fkey" FOREIGN KEY ("freelance_request_id") REFERENCES "freelance_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freelance_request_portages" ADD CONSTRAINT "freelance_request_portages_portage_id_fkey" FOREIGN KEY ("portage_id") REFERENCES "portages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
