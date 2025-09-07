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
    // Find the formula record for the given vehicle power
    const formulaRecord = await prisma.fraisKilometriquesReference.findUnique({
      where: {
        puissance_fiscale: puissanceFiscale,
      },
    });

    if (!formulaRecord) {
      logger.warn(`No formula found for puissance fiscale: ${puissanceFiscale}`);
      return 0;
    }

    let selectedFormula = '';

    // Select the appropriate formula based on distance
    if (distance <= 5000) {
      selectedFormula = formulaRecord.formule_jusqu_5000;
    } else if (distance <= 20000) {
      selectedFormula = formulaRecord.formule_entre_5001_20000;
    } else {
      selectedFormula = formulaRecord.formule_au_dela_20000;
    }

    // Replace 'd' with the actual distance and evaluate the formula
    const formulaWithDistance = selectedFormula.replace(/d/g, distance.toString());

    // Safely evaluate the mathematical expression
    let montantCalcule = 0;
    try {
      // Simple evaluation for expressions like "3000*0.665" or "15000*0.374+1457"
      montantCalcule = Function('"use strict"; return (' + formulaWithDistance + ')')();
    } catch (evalError) {
      logger.error('Error evaluating formula:', { formula: formulaWithDistance, error: evalError });
      return 0;
    }

    // Apply 20% bonus for electric vehicles
    if (typeVehicule === 'Véhicule électrique') {
      montantCalcule = montantCalcule * 1.2;
    }

    // Round to 2 decimal places
    const finalAmount = Math.round(montantCalcule * 100) / 100;

    logger.info('Frais kilométriques calculated successfully', {
      puissanceFiscale,
      distance,
      typeVehicule,
      selectedFormula,
      formulaWithDistance,
      baseAmount: Math.round(montantCalcule * 100) / 100,
      finalAmount,
      isElectric: typeVehicule === 'Véhicule électrique',
    });

    return finalAmount;
  } catch (error) {
    logger.error('Error calculating frais kilométriques:', error);
    return 0;
  }
}
