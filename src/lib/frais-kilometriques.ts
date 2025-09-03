/**
 * Utility functions for calculating "frais kilométriques" (mileage allowances)
 * Based on French tax regulations (barème fiscal officiel) stored in database
 */

import { prisma } from '@/lib/prisma';
import { logger } from './logger';

export interface FraisKilometriquesData {
  puissanceFiscale: string;
  distanceParcourue: string;
  typeVehicule: string;
}

/**
 * Calculate mileage allowances using database reference table
 * @param puissanceFiscale - Vehicle power category
 * @param distanceParcourue - Distance in kilometers (as string)
 * @param typeVehicule - Vehicle type (thermique or électrique)
 * @returns Calculated amount as number
 */
export async function calculateFraisKilometriquesAmount(
  puissanceFiscale: string,
  distanceParcourue: string,
  typeVehicule: string
): Promise<number> {
  const distance = parseFloat(distanceParcourue);
  
  if (isNaN(distance) || distance <= 0) {
    return 0;
  }

  try {
    // Find the appropriate rate from the database
    const rateRecord = await prisma.fraisKilometriquesReference.findFirst({
      where: {
        puissance_fiscale: puissanceFiscale,
        distance_min: { lte: distance },
        OR: [
          { distance_max: null }, // For unlimited range (> 20000)
          { distance_max: { gte: distance } }, // For limited ranges
        ],
      },
      orderBy: [
        { distance_min: 'desc' }, // Get the highest matching minimum distance
      ],
    });

    if (!rateRecord) {
      logger.warn(`No rate found for ${puissanceFiscale} and ${distance} km`);
      return 0;
    }

    let montantCalcule = 0;

    // Calculate based on the formula type
    if (rateRecord.formule_fixe && rateRecord.taux_variable) {
      // Middle range formula: (d × taux_variable) + formule_fixe
      montantCalcule = (distance * rateRecord.taux_variable) + rateRecord.formule_fixe;
    } else {
      // Simple multiplication: d × taux_par_km
      montantCalcule = distance * rateRecord.taux_par_km;
    }

    // Apply 20% bonus for electric vehicles
    if (typeVehicule === 'Véhicule électrique') {
      montantCalcule = montantCalcule * 1.2;
    }

    // Round to 2 decimal places
    return Math.round(montantCalcule * 100) / 100;
    
  } catch (error) {
    logger.error('Error calculating frais kilométriques:', error);
    return 0;
  }
}
