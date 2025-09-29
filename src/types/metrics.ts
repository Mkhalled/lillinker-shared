/**
 * Interface for calculated metrics from French portage salarial simulation
 */
export interface CalculatedMetrics {
  /** Total revenue (TJM × days) */
  chiffreAffaires: number;

  /** Management fees percentage */
  fraisGestionPercent: number;

  /** Management fees amount in euros */
  fraisGestionAmount: number;

  /** Total employer social contribution percentage */
  totalPatronalPercent: number;

  /** Total employee social contribution percentage */
  totalSalarialPercent: number;

  /** Total employer social contributions amount in euros */
  totalPatronalAmount: number;

  /** Total employee social contributions amount in euros */
  totalSalarialAmount: number;

  /** Total professional services charges amount in euros */
  totalChargesProAmount: number;

  /** Total professional services charges percentage */
  totalChargesProPercent: number;

  /** Total charges (employer + employee) in euros */
  totalCharges: number;

  /** Remaining amount after all deductions + services */
  restCANet: number;

  /** Gross salary amount in euros */
  grossSalary: number;

  /** Net salary after employee contributions */
  netSalary: number;

  /** Gross salary amount in euros (alias for compatibility) */
  brutSalary: number;

  /** Total employer social contributions in euros (alias for compatibility) */
  chargesPatronales: number;

  /** Total employee social contributions in euros (alias for compatibility) */
  chargesSalariales: number;

  /** Net salary before professional services in euros (alias for compatibility) */
  netBeforeServices: number;

  /** Total cost of selected professional services in euros (alias for compatibility) */
  selectedServicesTotal: number;

  /** Final net amount received (net + services) in euros (alias for compatibility) */
  netFinal: number;

  /** Percentage of revenue received by the freelancer */
  percentageRecu: number;
}
