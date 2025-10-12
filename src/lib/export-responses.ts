import * as XLSX from 'xlsx';

import { ExistingCompanyResponse } from '@/types/company-response';
import { CalculatedMetrics } from '@/types/metrics';

import { calculateMetrics } from './payroll-calculations';

interface ExportResponse {
  response: ExistingCompanyResponse;
  metrics: CalculatedMetrics;
  requestData: { tjm: number; days: number };
}

export const exportResponsesToXLSX = (
  responses: ExistingCompanyResponse[],
  tjm: number,
  days: number,
  filename: string = 'reponses-portage-salarial'
) => {
  const exportData: ExportResponse[] = responses.map(response => ({
    response,
    metrics: calculateMetrics(response, tjm, days),
    requestData: { tjm, days },
  }));

  const chiffreAffaires = tjm * days;

  // Create an empty workbook
  const workbook = XLSX.utils.book_new();

  // Create worksheet data
  const worksheetData: (string | number)[][] = [];

  // Add column headers
  worksheetData.push([
    'N°',
    'Entreprise',
    'Date',
    'TJM (€)',
    'Jours',
    'CA HT (€)',
    'Charge Frais de Gestion (€)',
    'Charge Salariale (€)',
    'Charge Patronale (€)',
    'Frais Professionnels (€)',
    'Salaire Brut (€)',
    'Salaire Net Avant Impôt (€)',
    'Salaire Net Après Impôt (€)',
    'Pourcentage Net Final (%)',
  ]);

  // Add data rows
  exportData.forEach((item, index) => {
    const { response, metrics } = item;

    worksheetData.push([
      index + 1,
      response.company?.name.slice(0, 3).toUpperCase() || 'N/A',
      new Date(response.created_at).toLocaleDateString('fr-FR'),
      tjm,
      days,
      chiffreAffaires.toFixed(2),
      metrics.fraisGestionAmount.toFixed(2),
      metrics.chargesSalariales.toFixed(2),
      metrics.chargesPatronales.toFixed(2),
      metrics.selectedServicesTotal.toFixed(2),
      metrics.brutSalary.toFixed(2),
      metrics.netBeforeServices.toFixed(2),
      metrics.netFinal.toFixed(2),
      metrics.percentageRecu.toFixed(2),
    ]);
  });

  // Create worksheet from array
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },
    { wch: 25 },
    { wch: 12 },
    { wch: 10 },
    { wch: 8 },
    { wch: 15 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 18 },
    { wch: 25 },
    { wch: 25 },
    { wch: 22 },
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Réponses');

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}-${date}.xlsx`;

  // Write and download file
  XLSX.writeFile(workbook, finalFilename);
};
