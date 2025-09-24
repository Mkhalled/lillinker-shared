/**
 * Interface for calculated metrics from French portage salarial simulation
 */
export interface CalculatedMetrics {
  /** Total revenue (TJM × days) */
  chiffreAffaires: number;
  
  /** Management fees amount in euros */
  fraisGestionAmount: number;
  
  /** Gross salary amount in euros */
  brutSalary: number;
  
  /** Total employer social contributions in euros */
  chargesPatronales: number;
  
  /** Total employee social contributions in euros */
  chargesSalariales: number;
  
  /** Net salary before professional services in euros */
  netBeforeServices: number;
  
  /** Total cost of selected professional services in euros */
  selectedServicesTotal: number;
  
  /** Final net amount received (net + services) in euros */
  netFinal: number;
  
  /** Percentage of revenue received by the freelancer */
  percentageRecu: number;
}