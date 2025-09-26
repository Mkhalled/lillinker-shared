import { ExistingCompanyResponse } from '@/types/company-response';
import { CalculatedMetrics } from '@/types/metrics';

/**
 * Calculates French portage salarial metrics based on company response data
 * @param response - The company response data containing rates and services
 * @param tjm - Daily rate (Taux Journalier Moyen)
 * @param days - Number of working days
 * @returns Calculated metrics for payroll simulation
 */
export const calculateMetrics = (
  response: ExistingCompanyResponse, 
  tjm: number, 
  days: number
): CalculatedMetrics => {
  const chiffreAffaires = tjm * days;
  const fraisGestionPercent = response.response_data.frais_de_gestion.value || 0;
  const fraisGestionAmount = (chiffreAffaires * fraisGestionPercent) / 100;
  
  // Get social contribution rates
  const totalPatronalPercent =
    response.response_data.selected_organismes?.reduce(
      (sum, org) => sum + org.total_patronal,
      0
    ) || 0;
  const totalSalarialPercent =
    response.response_data.selected_organismes?.reduce(
      (sum, org) => sum + org.total_salarial,
      0
    ) || 0;
  
  // Professional charges
  const totalChargesProAmount =
    response.response_data.services?.reduce((sum, service) => sum + service.charge_pro, 0) || 0;

  // French portage calculation: CA - Management fees = remaining amount
  const remainingAfterManagement = chiffreAffaires - fraisGestionAmount;
  
  // Calculate gross salary: remaining / (1 + employer rate%)
  const employerRateDecimal = totalPatronalPercent / 100;
  const grossSalary = remainingAfterManagement / (1 + employerRateDecimal);
  
  // Calculate actual patronal charges from gross salary
  const totalPatronalAmount = grossSalary * employerRateDecimal;
  
  // Calculate employee social contributions from gross salary
  const totalSalarialAmount = (grossSalary * totalSalarialPercent) / 100;
  
  // Net salary after employee contributions
  const netSalary = grossSalary - totalSalarialAmount;
  
  // Total charges (employer + employee)
  const totalCharges = totalPatronalAmount + totalSalarialAmount;
  
  // Final amount received (net salary + professional services)
  const restCANet = netSalary + totalChargesProAmount;
  const percentageRecu = chiffreAffaires > 0 ? (restCANet / chiffreAffaires) * 100 : 0;

  return {
    chiffreAffaires,
    fraisGestionPercent,
    totalPatronalPercent,
    totalSalarialPercent,
    fraisGestionAmount,
    totalPatronalAmount,
    totalSalarialAmount,
    totalChargesProAmount,
    totalCharges,
    restCANet,
    percentageRecu,
    grossSalary,
    netSalary,
    // Additional properties for ResponseDetails modal
    brutSalary: grossSalary,
    chargesPatronales: totalPatronalAmount,
    chargesSalariales: totalSalarialAmount,
    netBeforeServices: netSalary,
    selectedServicesTotal: totalChargesProAmount,
    netFinal: restCANet,
  };
};