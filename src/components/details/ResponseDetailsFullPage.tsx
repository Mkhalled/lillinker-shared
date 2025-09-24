'use client';
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

import type { ExistingCompanyResponse } from '@/types/company-response';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ResponseDetailsProps {
  response: ExistingCompanyResponse;
  metrics: {
    chiffreAffaires: number;
    fraisGestionAmount: number;
    brutSalary: number;
    chargesPatronales: number;
    chargesSalariales: number;
    netBeforeServices: number;
    selectedServicesTotal: number;
    netFinal: number;
    percentageRecu: number;
  };
  requestData: {
    tjm: number;
    days: number;
  };
  onBack: () => void;
}

const ResponseDetails: React.FC<ResponseDetailsProps> = ({ 
  response, 
  metrics, 
  requestData, 
  onBack 
}) => {

  // Chart.js configuration
  const chartData = {
    labels: [
      'Salaire net versé',
      'Frais de gestion',
      'Cotisations patronales',
      'Cotisations salariales',
    ],
    datasets: [
      {
        data: [
          metrics.netBeforeServices,
          metrics.fraisGestionAmount,
          metrics.chargesPatronales,
          metrics.chargesSalariales,
        ],
        backgroundColor: [
          '#F6D55C', // Yellow for net salary
          '#ED553B', // Red for management fees
          '#3CAEA3', // Teal for employer contributions
          '#F38BA8', // Pink for employee contributions
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const percentage = ((value / metrics.chiffreAffaires) * 100).toFixed(1);
            return `${context.label}: ${value.toFixed(2)}€ (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">SIMULATION DE PORTAGE SALARIAL</h1>
          <p className="text-blue-100">DATE : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <button
          onClick={onBack}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Company Information Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Informations société</h3>
              <p className="text-sm"><strong>Société :</strong> {response.company?.name || 'N/A'}</p>
              <p className="text-sm"><strong>Frais de gestion :</strong> {response.response_data.frais_de_gestion.value}%</p>
              <p className="text-sm"><strong>TJM :</strong> {requestData.tjm} €</p>
              <p className="text-sm"><strong>Nombre de jours :</strong> {requestData.days}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Chiffre d'affaires</h3>
              <p className="text-3xl font-bold text-blue-600">{metrics.chiffreAffaires.toFixed(2)} €</p>
              <p className="text-sm text-gray-600">HT mensuel</p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Net à payer (salaire + frais)</h3>
              <p className="text-3xl font-bold text-green-600">{metrics.netFinal.toFixed(2)} €</p>
              <p className="text-sm text-gray-600">{metrics.percentageRecu.toFixed(2)}% du CA</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Detailed Payslip */}
          <div className="lg:col-span-2">
            
            {/* Payslip Table - Following exact format from image */}
            <div className="bg-white border-2 border-gray-400 rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-100 border-b-2 border-gray-400">
                <div className="grid grid-cols-6 gap-0 text-xs font-bold text-center">
                  <div className="border-r border-gray-400 p-2">Éléments de paie</div>
                  <div className="border-r border-gray-400 p-2">Base</div>
                  <div className="border-r border-gray-400 p-2">Taux salarial</div>
                  <div className="border-r border-gray-400 p-2">Montant salarial</div>
                  <div className="border-r border-gray-400 p-2">Taux patronal</div>
                  <div className="p-2">Charges patronales</div>
                </div>
              </div>
              
              {/* Salary Base */}
              <div className="grid grid-cols-6 gap-0 text-xs border-b border-gray-300">
                <div className="border-r border-gray-300 p-2 font-medium">Salaire de base</div>
                <div className="border-r border-gray-300 p-2 text-right">{metrics.brutSalary.toFixed(2)} €</div>
                <div className="border-r border-gray-300 p-2 text-right">31.3%</div>
                <div className="border-r border-gray-300 p-2 text-right">{metrics.chargesSalariales.toFixed(2)} €</div>
                <div className="border-r border-gray-300 p-2 text-right">5%</div>
                <div className="p-2 text-right">{(metrics.brutSalary * 0.05).toFixed(2)} €</div>
              </div>
              
              {/* Additional salary elements */}
              <div className="grid grid-cols-6 gap-0 text-xs border-b border-gray-300">
                <div className="border-r border-gray-300 p-2">Indemnité d'activité partielle</div>
                <div className="border-r border-gray-300 p-2 text-right">{(metrics.brutSalary * 0.8).toFixed(2)} €</div>
                <div className="border-r border-gray-300 p-2 text-right">5%</div>
                <div className="border-r border-gray-300 p-2 text-right">{(metrics.brutSalary * 0.04).toFixed(2)} €</div>
                <div className="border-r border-gray-300 p-2 text-right"></div>
                <div className="p-2 text-right"></div>
              </div>
              
              <div className="grid grid-cols-6 gap-0 text-xs border-b border-gray-300">
                <div className="border-r border-gray-300 p-2">Indemnité de Congés Payés</div>
                <div className="border-r border-gray-300 p-2 text-right">{(metrics.brutSalary * 0.092).toFixed(2)} €</div>
                <div className="border-r border-gray-300 p-2 text-right">10%</div>
                <div className="border-r border-gray-300 p-2 text-right">{(metrics.brutSalary * 0.0092).toFixed(2)} €</div>
                <div className="border-r border-gray-300 p-2 text-right"></div>
                <div className="p-2 text-right"></div>
              </div>
              
              <div className="grid grid-cols-6 gap-0 text-xs border-b-2 border-gray-400 bg-gray-50">
                <div className="border-r border-gray-300 p-2 font-bold">Salaire Brut</div>
                <div className="border-r border-gray-300 p-2 text-right"></div>
                <div className="border-r border-gray-300 p-2 text-right">31.3%</div>
                <div className="border-r border-gray-300 p-2 text-right font-bold">{metrics.brutSalary.toFixed(2)} €</div>
                <div className="border-r border-gray-300 p-2 text-right"></div>
                <div className="p-2 text-right"></div>
              </div>
              
              {/* Health section */}
              <div className="bg-gray-50 border-b border-gray-300">
                <div className="p-2 font-bold text-sm">Santé</div>
              </div>
              
              {/* Individual social contributions */}
              {response.response_data.selected_organismes?.map((organisme, index) => (
                <div key={index} className="grid grid-cols-6 gap-0 text-xs border-b border-gray-300">
                  <div className="border-r border-gray-300 p-2">{organisme.label}</div>
                  <div className="border-r border-gray-300 p-2 text-right">{metrics.brutSalary.toFixed(2)} €</div>
                  <div className="border-r border-gray-300 p-2 text-right">{organisme.total_salarial.toFixed(3)}%</div>
                  <div className="border-r border-gray-300 p-2 text-right">{((metrics.brutSalary * organisme.total_salarial) / 100).toFixed(2)} €</div>
                  <div className="border-r border-gray-300 p-2 text-right">{organisme.total_patronal.toFixed(3)}%</div>
                  <div className="p-2 text-right">{((metrics.brutSalary * organisme.total_patronal) / 100).toFixed(2)} €</div>
                </div>
              ))}
              
              {/* Net salary section */}
              <div className="grid grid-cols-6 gap-0 text-xs border-b-2 border-gray-400 bg-green-50">
                <div className="border-r border-gray-300 p-2 font-bold">NET IMPOSABLE</div>
                <div className="border-r border-gray-300 p-2 text-right"></div>
                <div className="border-r border-gray-300 p-2 text-right"></div>
                <div className="border-r border-gray-300 p-2 text-right font-bold">{metrics.netBeforeServices.toFixed(2)} €</div>
                <div className="border-r border-gray-300 p-2 text-right"></div>
                <div className="p-2 text-right"></div>
              </div>
              
              {/* Final net section */}
              <div className="grid grid-cols-6 gap-0 text-xs bg-yellow-50">
                <div className="border-r border-gray-300 p-2 font-bold">NET À PAYER</div>
                <div className="border-r border-gray-300 p-2 text-right"></div>
                <div className="border-r border-gray-300 p-2 text-right"></div>
                <div className="border-r border-gray-300 p-2 text-right font-bold">{metrics.netFinal.toFixed(2)} €</div>
                <div className="border-r border-gray-300 p-2 text-right"></div>
                <div className="p-2 text-right"></div>
              </div>
            </div>

            {/* Summary Table */}
            <div className="bg-white border-2 border-gray-400 rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-100 border-b border-gray-400 p-3">
                <h4 className="font-bold text-sm">Détail du Calcul</h4>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="font-bold border-b border-gray-300 pb-1 mb-2">heures</div>
                    <div>Mensuel :</div>
                    <div>Cumul :</div>
                  </div>
                  <div>
                    <div className="font-bold border-b border-gray-300 pb-1 mb-2 text-right">brut</div>
                    <div className="text-right">{(requestData.days * 7).toFixed(1)}</div>
                    <div className="text-right">{(requestData.days * 7).toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="font-bold border-b border-gray-300 pb-1 mb-2 text-right">Charges salariales</div>
                    <div className="text-right">{metrics.brutSalary.toFixed(2)} €</div>
                    <div className="text-right">{metrics.brutSalary.toFixed(2)} €</div>
                  </div>
                  <div>
                    <div className="font-bold border-b border-gray-300 pb-1 mb-2 text-right">Charges patronales Coût global</div>
                    <div className="text-right">{metrics.chargesSalariales.toFixed(2)} €</div>
                    <div className="text-right">{metrics.chargesPatronales.toFixed(2)} €</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="bg-green-100 border border-green-300 rounded p-3 text-center">
                    <div className="font-bold text-lg">Net payé (salaire + frais)</div>
                    <div className="text-2xl font-bold text-green-600">{metrics.netFinal.toFixed(2)} €</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Section */}
            {response.response_data.services && response.response_data.services.length > 0 && (
              <div className="bg-white border-2 border-gray-400 rounded-lg overflow-hidden mb-6">
                <div className="bg-blue-100 border-b border-gray-400 p-3">
                  <h4 className="font-bold text-sm">Services Professionnels Sélectionnés</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {response.response_data.services
                    .filter(service => service.is_available)
                    .map((service, index) => (
                      <div key={index} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">{service.service_name}</h5>
                            <p className="text-sm text-gray-600">{service.service_description || 'Service professionnel'}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{service.charge_pro.toFixed(2)} €</div>
                            <div className="text-sm text-gray-600">par mois</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  <div className="bg-blue-50 p-4">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total Services Professionnels:</span>
                      <span className="text-blue-600">{metrics.selectedServicesTotal.toFixed(2)} €</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Chart and Additional Info */}
          <div className="space-y-6">
            
            {/* Pie Chart */}
            <div className="bg-white border-2 border-gray-400 rounded-lg p-6">
              <h4 className="font-bold text-gray-800 mb-4 text-center">
                Répartition des Charges
              </h4>
              <div className="h-80 flex items-center justify-center">
                <Pie data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Management Fees Coverage */}
            <div className="bg-gray-50 border-2 border-gray-400 rounded-lg p-6">
              <h4 className="font-bold text-gray-800 mb-3">
                Les frais de gestion couvrent :
              </h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Mise en place du dossier du salarié
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Établissement des contrats
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Facturation et relance clients
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Assistance juridique
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Bulletins de paie et déclarations
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Outils de gestion
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Recouvrement cotisations
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Assurance responsabilité civile
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6">
              <h4 className="font-bold text-blue-800 mb-3">Contact</h4>
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>Responsable portage salarial :</strong></p>
                <p>Ikram BOURAHLA</p>
                <p>📞 +33 7 86 45 01 75</p>
                <p>📞 +33 1 84 79 34 80</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseDetails;