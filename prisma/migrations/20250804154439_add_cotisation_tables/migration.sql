-- CreateEnum
CREATE TYPE "CotisationType" AS ENUM ('PATRONAL', 'SALARIAL', 'DEUX');

-- CreateTable
CREATE TABLE "organismes" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "organismes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotisations" (
    "id" SERIAL NOT NULL,
    "organisme_id" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "type" "CotisationType" NOT NULL,
    "pourcentage_salarial" DOUBLE PRECISION,
    "pourcentage_patronal" DOUBLE PRECISION,

    CONSTRAINT "cotisations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "organismes" ADD CONSTRAINT "organismes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotisations" ADD CONSTRAINT "cotisations_organisme_id_fkey" FOREIGN KEY ("organisme_id") REFERENCES "organismes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
