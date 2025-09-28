import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import ResponseDetailsPDF from '@/components/pdf/ResponseDetailsPDF';
import { ExistingCompanyResponse } from '@/types/company-response';
import { CalculatedMetrics } from '@/types/metrics';

interface UsePDFDownloadProps {
  response: ExistingCompanyResponse;
  metrics: CalculatedMetrics;
  requestData: { tjm: number; days: number };
}

export const usePDFDownload = ({ response, metrics, requestData }: UsePDFDownloadProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    try {
      setIsGenerating(true);

      // Generate PDF blob 
      const blob = await pdf(
        ResponseDetailsPDF({ response, metrics, requestData }) as any
      ).toBlob();

      // Generate filename with company name and date  
      const companyName = response.company?.name.slice(0, 3).toUpperCase() || 'simulation';
      const date = new Date().toISOString().split('T')[0];
      const filename = `simulation-portage-${companyName}-${date}.pdf`;

      // Download the file
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    downloadPDF,
    isGenerating
  };
};