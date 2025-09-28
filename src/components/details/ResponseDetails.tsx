import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import React from 'react';
import { Pie } from 'react-chartjs-2';

import {
  ExistingCompanyResponse,
  SelectedOrganisme,
  ServiceResponseData,
} from '@/types/company-response';
import { CalculatedMetrics } from '@/types/metrics';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ResponseDetailsProps {
  response: ExistingCompanyResponse;
  metrics: CalculatedMetrics;
  requestData: { tjm: number; days: number };
  onBack: () => void;
}

const ResponseDetails: React.FC<ResponseDetailsProps> = ({
  response,
  metrics,
  requestData,
  onBack,
}) => {
  // Helper function to format dates
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Chart.js configuration for pie chart
  const chartData = {
    labels: ['Net Final', 'Charges Salariales', 'Charges Patronales', 'Frais de Gestion'],
    datasets: [
      {
        data: [
          metrics.netFinal || 0,
          metrics.chargesSalariales || 0,
          metrics.chargesPatronales || 0,
          metrics.fraisGestionAmount || 0,
        ],
        backgroundColor: [
          '#10B981', // Green for net final
          '#EF4444', // Red for salarial charges
          '#3B82F6', // Blue for patronal charges
          '#F59E0B', // Orange for management fees
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: { label?: string; parsed: number }) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = ((value / metrics.chiffreAffaires) * 100).toFixed(1);
            return `${label}: ${value.toFixed(2)} € (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={onBack}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Retour
        </button>
      </div>

      {/* Yellow Header Section */}
      <div className="bg-[var(--primary-color)] border-l-8 border-[#28007e] mx-6 mb-6 rounded-r-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left: Company Title */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">SIMULATION DE PORTAGE SALARIAL</h1>
            <p className="text-sm text-white">DATE : {formatDate(new Date())}</p>
          </div>

          {/* Center: Revenue Info */}
          <div className="text-center">
            <p className="text-sm text-white mb-1">Chiffre d&apos;affaires</p>
            <p className="text-sm text-white">(HT mensuel)</p>
            <p className="text-4xl font-bold text-white my-2">
              {(metrics.chiffreAffaires || 0).toFixed(0)} €
            </p>
          </div>

          {/* Right: Contract Details */}
          <div className="bg-white rounded p-4 shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">TJM</span>
                <span className="text-sm font-semibold">{requestData.tjm}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Nombre de jours travaillés</span>
                <span className="text-sm font-semibold">{requestData.days} J/MOIS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Net à payer avant impôt</span>
                <span className="text-sm font-semibold">
                  {(metrics.netBeforeServices || 0).toFixed(0)} €/MOIS
                </span>
              </div>
              {response.response_data?.frais_de_gestion && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Frais de gestion</span>
                  <span className="text-sm font-semibold">
                    {response.response_data.frais_de_gestion.value}%
                  </span>
                </div>
              )}
            </div>
            {/* Only show additional services if they exist */}
            {response.response_data?.services &&
              response.response_data.services.some((s: ServiceResponseData) => s.is_available) && (
                <div className="mt-4 text-right">
                  <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
                    {
                      response.response_data.services.filter(
                        (s: ServiceResponseData) => s.is_available
                      ).length
                    }{' '}
                    service(s) inclus
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Payroll Breakdown Table */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Éléments de la simulation</h3>

            {/* Payroll Breakdown Table */}
            <div className="bg-white border border-gray-300 rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-semibold">Éléments de la simulation</th>
                    <th className="text-right p-3 font-semibold">Montant</th>
                    <th className="text-right p-3 font-semibold">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Chiffre d'affaires */}
                  <tr className="border-b bg-blue-50">
                    <td className="p-3 font-semibold">Chiffre d&apos;affaires HT</td>
                    <td className="p-3 text-right font-semibold">
                      {(metrics.chiffreAffaires || 0).toFixed(2)} €
                    </td>
                    <td className="p-3 text-right font-semibold">100.00 %</td>
                  </tr>

                  {/* Management Fees */}
                  <tr className="border-b">
                    <td className="p-3">Frais de gestion</td>
                    <td className="p-3 text-right">
                      -{(metrics.fraisGestionAmount || 0).toFixed(2)} €
                    </td>
                    <td className="p-3 text-right">
                      {(
                        ((metrics.fraisGestionAmount || 0) / (metrics.chiffreAffaires || 1)) *
                        100
                      ).toFixed(2)}{' '}
                      %
                    </td>
                  </tr>

                  {/* Remaining after management fees */}
                  <tr className="border-b font-medium bg-gray-50">
                    <td className="p-3">Montant restant après frais de gestion</td>
                    <td className="p-3 text-right">
                      {((metrics.chiffreAffaires || 0) - (metrics.fraisGestionAmount || 0)).toFixed(
                        2
                      )}{' '}
                      €
                    </td>
                    <td className="p-3 text-right">
                      {(
                        (((metrics.chiffreAffaires || 0) - (metrics.fraisGestionAmount || 0)) /
                          (metrics.chiffreAffaires || 1)) *
                        100
                      ).toFixed(2)}{' '}
                      %
                    </td>
                  </tr>
                  {/* Detailed Employer Social Contributions (for information) */}
                  <tr className="border-b bg-gray-100">
                    <td className="p-3 text-sm font-semibold italic text-gray-700" colSpan={3}>
                      Charges sociales patronales (payées par l&apos;employeur - à titre informatif)
                    </td>
                  </tr>
                  {response.response_data?.selected_organismes?.map(
                    (organisme: SelectedOrganisme, index: number) => (
                      <tr key={`patronal-${index}`} className="border-b bg-gray-50">
                        <td className="p-3 pl-6 text-sm italic">• {organisme.label} (Patronal)</td>
                        <td className="p-3 text-right text-sm italic">
                          {(
                            ((metrics.brutSalary || 0) * (organisme.total_patronal || 0)) /
                            100
                          ).toFixed(2)}{' '}
                          €
                        </td>
                        <td className="p-3 text-right text-sm italic">
                          {(organisme.total_patronal || 0).toFixed(3)} %
                        </td>
                      </tr>
                    )
                  )}

                  {/* Total Employer Contributions */}
                  <tr className="border-b bg-gray-100">
                    <td className="p-3 text-sm font-semibold italic">Total charges patronales</td>
                    <td className="p-3 text-right text-sm font-semibold italic">
                      {(metrics.chargesPatronales || 0).toFixed(2)} €
                    </td>
                    <td className="p-3 text-right text-sm font-semibold italic">
                      {(
                        ((metrics.chargesPatronales || 0) / (metrics.brutSalary || 1)) *
                        100
                      ).toFixed(2)}{' '}
                      %
                    </td>
                  </tr>
                  {/* Gross Salary */}
                  <tr className="border-b bg-blue-50">
                    <td className="p-3 font-semibold">Salaire brut</td>
                    <td className="p-3 text-right font-semibold">
                      {(metrics.brutSalary || 0).toFixed(2)} €
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {(((metrics.brutSalary || 0) / (metrics.chiffreAffaires || 1)) * 100).toFixed(
                        2
                      )}{' '}
                      %
                    </td>
                  </tr>
                  {/* Detailed Employer Social Contributions (for information) */}
                  <tr className="border-b bg-gray-100">
                    <td className="p-3 text-sm font-semibold italic text-gray-700" colSpan={3}>
                      Charges sociales salariales (payées par le salarié)
                    </td>
                  </tr>
                  {/* Detailed Employee Social Contributions */}
                  {response.response_data?.selected_organismes?.map(
                    (organisme: SelectedOrganisme, index: number) => (
                      <tr key={`salarial-${index}`} className="border-b">
                        <td className="p-3 pl-6">• {organisme.label} (Salarial)</td>
                        <td className="p-3 text-right">
                          -
                          {(
                            ((metrics.brutSalary || 0) * (organisme.total_salarial || 0)) /
                            100
                          ).toFixed(2)}{' '}
                          €
                        </td>
                        <td className="p-3 text-right">
                          {(organisme.total_salarial || 0).toFixed(3)} %
                        </td>
                      </tr>
                    )
                  )}

                  {/* Total Employee Contributions */}
                  <tr className="border-b font-medium bg-red-50">
                    <td className="p-3">Total charges sociales salariales</td>
                    <td className="p-3 text-right font-semibold">
                      -{(metrics.chargesSalariales || 0).toFixed(2)} €
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {(
                        ((metrics.chargesSalariales || 0) / (metrics.brutSalary || 1)) *
                        100
                      ).toFixed(2)}{' '}
                      %
                    </td>
                  </tr>

                  {/* Net Salary */}
                  <tr className="border-b font-semibold bg-green-50">
                    <td className="p-3">Net à payer (imposable)</td>
                    <td className="p-3 text-right">
                      {(metrics.netBeforeServices || 0).toFixed(2)} €
                    </td>
                    <td className="p-3 text-right">
                      {(
                        ((metrics.netBeforeServices || 0) / (metrics.chiffreAffaires || 1)) *
                        100
                      ).toFixed(2)}{' '}
                      %
                    </td>
                  </tr>

                  {/* Detailed Professional Services */}
                  {response.response_data?.services
                    ?.filter((service: ServiceResponseData) => service.is_available)
                    .map((service: ServiceResponseData, index: number) => (
                      <tr key={`service-${index}`} className="border-b">
                        <td className="p-3 pl-6">• {service.service_name}</td>
                        <td className="p-3 text-right">
                          +{(service.charge_pro || 0).toFixed(2)} €
                        </td>
                        <td className="p-3 text-right">
                          {(
                            ((service.charge_pro || 0) / (metrics.chiffreAffaires || 1)) *
                            100
                          ).toFixed(2)}{' '}
                          %
                        </td>
                      </tr>
                    ))}

                  {/* Total Services */}
                  {(metrics.selectedServicesTotal || 0) > 0 && (
                    <tr className="border-b font-medium bg-blue-50">
                      <td className="p-3">Total services professionnels</td>
                      <td className="p-3 text-right font-semibold">
                        +{(metrics.selectedServicesTotal || 0).toFixed(2)} €
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {(
                          ((metrics.selectedServicesTotal || 0) / (metrics.chiffreAffaires || 1)) *
                          100
                        ).toFixed(2)}{' '}
                        %
                      </td>
                    </tr>
                  )}
                  {/* Final Net Amount */}
                  <tr className="border-b font-bold bg-yellow-50">
                    <td className="p-3">Net final reçu</td>
                    <td className="p-3 text-right">{(metrics.netFinal || 0).toFixed(2)} €</td>
                    <td className="p-3 text-right">{(metrics.percentageRecu || 0).toFixed(2)} %</td>
                  </tr>
                </tbody>
              </table>

              {/* Footer Notes */}
              <div className="p-4 text-xs text-gray-600 border-t bg-gray-50">
                <p>
                  * Cette simulation est donnée à titre indicatif et n&apos;a aucun caractère
                  contractuel
                </p>
                <p>
                  * Tous nos services de portage salarial sont comprenant la gestion intégrale du
                  salaire, gestion de votre activité, assurances, formations...
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Pie Chart and Management Fees */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pie Chart */}
            <div className="bg-white border border-gray-300 rounded p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Répartition des coûts</h4>
              <div className="h-64 flex items-center justify-center">
                <Pie data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Management Fees Coverage */}
            <div className="bg-white border border-gray-300 rounded p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">
                Frais de gestion{' '}
                {(
                  response.response_data?.frais_de_gestion?.value ||
                  ((metrics.fraisGestionAmount || 0) / (metrics.chiffreAffaires || 1)) * 100
                ).toFixed(2)}
                %
              </h4>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {(metrics.fraisGestionAmount || 0).toFixed(2)} €
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {response.response_data?.frais_de_gestion?.manual
                    ? 'Calculé manuellement'
                    : 'Calculé automatiquement'}
                </p>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-white border border-gray-300 rounded p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Résumé</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Chiffre d&apos;affaires</span>
                  <span className="font-semibold">
                    {(metrics.chiffreAffaires || 0).toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Net imposable</span>
                  <span className="font-semibold">
                    {(metrics.netBeforeServices || 0).toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">% reçu du CA</span>
                  <span className="font-semibold">{(metrics.percentageRecu || 0).toFixed(2)}%</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold">
                    <span>Net final</span>
                    <span className="text-green-600">{(metrics.netFinal || 0).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseDetails;
