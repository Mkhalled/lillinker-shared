/**
 * Utility functions for calculating "frais kilométriques" (mileage allowances)
 * Based on French tax regulations (barème fiscal officiel)
 */

export interface FraisKilometriquesData {
  puissanceFiscale: string;
  distanceParcourue: string;
  typeVehicule: string;
}

/**
 * Calculate mileage allowances and return only the final amount
 * @param puissanceFiscale - Vehicle power category
 * @param distanceParcourue - Distance in kilometers (as string)
 * @param typeVehicule - Vehicle type (thermique or électrique)
 * @returns Calculated amount as number
 */
export function calculateFraisKilometriquesAmount(
  puissanceFiscale: string,
  distanceParcourue: string,
  typeVehicule: string
): number {
  const distance = parseFloat(distanceParcourue);
  
  if (isNaN(distance) || distance <= 0) {
    return 0;
  }

  const d = distance;
  let montantCalcule = 0;

  // Define rates based on tax power and distance ranges
  const rates = {
    '3 cv et moins': {
      upTo5000: (d: number) => d * 0.529,
      from5001To20000: (d: number) => d * 0.316 + 1065,
      above20000: (d: number) => d * 0.370,
    },
    '4 cv': {
      upTo5000: (d: number) => d * 0.606,
      from5001To20000: (d: number) => d * 0.340 + 1330,
      above20000: (d: number) => d * 0.407,
    },
    '5 cv': {
      upTo5000: (d: number) => d * 0.636,
      from5001To20000: (d: number) => d * 0.357 + 1395,
      above20000: (d: number) => d * 0.427,
    },
    '6 cv': {
      upTo5000: (d: number) => d * 0.665,
      from5001To20000: (d: number) => d * 0.374 + 1457,
      above20000: (d: number) => d * 0.447,
    },
    '7 cv et plus': {
      upTo5000: (d: number) => d * 0.697,
      from5001To20000: (d: number) => d * 0.394 + 1515,
      above20000: (d: number) => d * 0.470,
    },
  };

  const powerRates = rates[puissanceFiscale as keyof typeof rates];
  
  if (!powerRates) {
    return 0;
  }

  // Calculate base amount based on distance range
  if (d <= 5000) {
    montantCalcule = powerRates.upTo5000(d);
  } else if (d <= 20000) {
    montantCalcule = powerRates.from5001To20000(d);
  } else {
    montantCalcule = powerRates.above20000(d);
  }

  // Apply 20% bonus for electric vehicles
  if (typeVehicule === 'Véhicule électrique') {
    montantCalcule = montantCalcule * 1.2;
  }

  // Round to 2 decimal places
  return Math.round(montantCalcule * 100) / 100;
}
