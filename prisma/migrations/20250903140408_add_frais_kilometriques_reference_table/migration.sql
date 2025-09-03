-- CreateTable
CREATE TABLE "frais_kilometriques_references" (
    "id" SERIAL NOT NULL,
    "puissance_fiscale" TEXT NOT NULL,
    "distance_min" INTEGER NOT NULL,
    "distance_max" INTEGER,
    "taux_par_km" DOUBLE PRECISION NOT NULL,
    "formule_fixe" DOUBLE PRECISION,
    "taux_variable" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "frais_kilometriques_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "frais_kilometriques_references_puissance_fiscale_distance_m_key" ON "frais_kilometriques_references"("puissance_fiscale", "distance_min");
