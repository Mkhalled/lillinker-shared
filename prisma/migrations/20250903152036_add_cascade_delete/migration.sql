/*
  Warnings:

  - You are about to drop the column `distance_max` on the `frais_kilometriques_references` table. All the data in the column will be lost.
  - You are about to drop the column `distance_min` on the `frais_kilometriques_references` table. All the data in the column will be lost.
  - You are about to drop the column `formule_fixe` on the `frais_kilometriques_references` table. All the data in the column will be lost.
  - You are about to drop the column `taux_par_km` on the `frais_kilometriques_references` table. All the data in the column will be lost.
  - You are about to drop the column `taux_variable` on the `frais_kilometriques_references` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[puissance_fiscale]` on the table `frais_kilometriques_references` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `formule_au_dela_20000` to the `frais_kilometriques_references` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formule_entre_5001_20000` to the `frais_kilometriques_references` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formule_jusqu_5000` to the `frais_kilometriques_references` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "freelance_requests" DROP CONSTRAINT "freelance_requests_freelance_id_fkey";

-- DropIndex
DROP INDEX "frais_kilometriques_references_puissance_fiscale_distance_m_key";

-- AlterTable
ALTER TABLE "frais_kilometriques_references" DROP COLUMN "distance_max",
DROP COLUMN "distance_min",
DROP COLUMN "formule_fixe",
DROP COLUMN "taux_par_km",
DROP COLUMN "taux_variable",
ADD COLUMN     "formule_au_dela_20000" TEXT NOT NULL,
ADD COLUMN     "formule_entre_5001_20000" TEXT NOT NULL,
ADD COLUMN     "formule_jusqu_5000" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "frais_kilometriques_references_puissance_fiscale_key" ON "frais_kilometriques_references"("puissance_fiscale");

-- AddForeignKey
ALTER TABLE "freelance_requests" ADD CONSTRAINT "freelance_requests_freelance_id_fkey" FOREIGN KEY ("freelance_id") REFERENCES "freelances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
