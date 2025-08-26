/*
  Warnings:

  - You are about to drop the column `metier_id` on the `freelances` table. All the data in the column will be lost.
  - You are about to drop the `company_metiers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `company_portages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `freelance_request_portages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `metiers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `portages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `secteur_activite_id` to the `freelances` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "company_metiers" DROP CONSTRAINT "company_metiers_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_metiers" DROP CONSTRAINT "company_metiers_metier_id_fkey";

-- DropForeignKey
ALTER TABLE "company_portages" DROP CONSTRAINT "company_portages_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_portages" DROP CONSTRAINT "company_portages_portage_id_fkey";

-- DropForeignKey
ALTER TABLE "freelance_request_portages" DROP CONSTRAINT "freelance_request_portages_freelance_request_id_fkey";

-- DropForeignKey
ALTER TABLE "freelance_request_portages" DROP CONSTRAINT "freelance_request_portages_portage_id_fkey";

-- DropForeignKey
ALTER TABLE "freelances" DROP CONSTRAINT "freelances_metier_id_fkey";

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "adresse" TEXT,
ADD COLUMN     "chiffre_affaires" DECIMAL(65,30),
ADD COLUMN     "code_naf_ape" TEXT,
ADD COLUMN     "convention_collective" TEXT,
ADD COLUMN     "date_creation" TIMESTAMP(3),
ADD COLUMN     "site_web" TEXT,
ALTER COLUMN "management_fees" DROP NOT NULL;

-- AlterTable
ALTER TABLE "freelances" DROP COLUMN "metier_id",
ADD COLUMN     "secteur_activite_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "platform_services" ALTER COLUMN "data_type" DROP NOT NULL,
ALTER COLUMN "data_label" DROP NOT NULL;

-- DropTable
DROP TABLE "company_metiers";

-- DropTable
DROP TABLE "company_portages";

-- DropTable
DROP TABLE "freelance_request_portages";

-- DropTable
DROP TABLE "metiers";

-- DropTable
DROP TABLE "portages";

-- CreateTable
CREATE TABLE "secteur_activite_companies" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "secteur_activite_id" INTEGER NOT NULL,

    CONSTRAINT "secteur_activite_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_labels" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "label_syndicat_id" INTEGER NOT NULL,

    CONSTRAINT "company_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_labels_selected" (
    "id" SERIAL NOT NULL,
    "freelance_request_id" INTEGER NOT NULL,
    "label_syndicat_id" INTEGER NOT NULL,

    CONSTRAINT "request_labels_selected_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secteur_activites" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "secteur_activites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "label_syndicats" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,

    CONSTRAINT "label_syndicats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "secteur_activite_companies_company_id_secteur_activite_id_key" ON "secteur_activite_companies"("company_id", "secteur_activite_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_labels_company_id_label_syndicat_id_key" ON "company_labels"("company_id", "label_syndicat_id");

-- CreateIndex
CREATE UNIQUE INDEX "request_labels_selected_freelance_request_id_label_syndicat_key" ON "request_labels_selected"("freelance_request_id", "label_syndicat_id");

-- CreateIndex
CREATE UNIQUE INDEX "secteur_activites_code_key" ON "secteur_activites"("code");

-- CreateIndex
CREATE UNIQUE INDEX "secteur_activites_name_key" ON "secteur_activites"("name");

-- CreateIndex
CREATE UNIQUE INDEX "label_syndicats_name_key" ON "label_syndicats"("name");

-- AddForeignKey
ALTER TABLE "freelances" ADD CONSTRAINT "freelances_secteur_activite_id_fkey" FOREIGN KEY ("secteur_activite_id") REFERENCES "secteur_activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secteur_activite_companies" ADD CONSTRAINT "secteur_activite_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secteur_activite_companies" ADD CONSTRAINT "secteur_activite_companies_secteur_activite_id_fkey" FOREIGN KEY ("secteur_activite_id") REFERENCES "secteur_activites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_labels" ADD CONSTRAINT "company_labels_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_labels" ADD CONSTRAINT "company_labels_label_syndicat_id_fkey" FOREIGN KEY ("label_syndicat_id") REFERENCES "label_syndicats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_labels_selected" ADD CONSTRAINT "request_labels_selected_freelance_request_id_fkey" FOREIGN KEY ("freelance_request_id") REFERENCES "freelance_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_labels_selected" ADD CONSTRAINT "request_labels_selected_label_syndicat_id_fkey" FOREIGN KEY ("label_syndicat_id") REFERENCES "label_syndicats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
