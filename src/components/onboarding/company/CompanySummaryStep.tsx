'use client';

import type { CompanyFormData } from '@/types/company';
import type { NewService } from '@/types/user';

interface CompanySummaryStepProps {
  formData: CompanyFormData;
  metiers: any[];
  portages: any[];
  platformServices: any[];
}

export const CompanySummaryStep = ({ 
  formData, 
  metiers, 
  portages, 
  platformServices 
}: CompanySummaryStepProps) => {
  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-3">Informations de la société</h4>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Nom:</span> {formData.companyName}</div>
          <div><span className="font-medium">SIRET:</span> {formData.siret}</div>
          <div><span className="font-medium">Type:</span> {formData.isPortage === "yes" ? "Société de portage salarial" : "Autre société"}</div>
          <div><span className="font-medium">Consultants:</span> {formData.consultantCount}</div>
          <div><span className="font-medium">Frais de gestion:</span> {formData.managementFeeRate}%</div>
        </div>
      </div>

      {/* Administrator Information */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-3">Administrateur</h4>
        <div className="space-y-2 text-sm">
          <div><span className="font-medium">Nom:</span> {formData.adminFirstName} {formData.adminLastName}</div>
          <div><span className="font-medium">Email:</span> {formData.adminEmail}</div>
          <div><span className="font-medium">Téléphone:</span> {formData.adminPhone}</div>
        </div>
      </div>

      {/* Métiers */}
      {formData.selectedMetiers.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Métiers supportés ({formData.selectedMetiers.length})</h4>
          <div className="flex flex-wrap gap-2">
            {formData.selectedMetiers.map((metierId: string) => {
              const metier = metiers?.find(m => m.id.toString() === metierId);
              return metier ? (
                <span key={metier.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {metier.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Portage Services */}
      {formData.isPortage === "yes" && formData.selectedPortages.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Associations de portage ({formData.selectedPortages.length})</h4>
          <div className="space-y-3">
            {formData.selectedPortages.map((portageId: string) => {
              const portage = portages?.find(p => p.id.toString() === portageId);
              return portage ? (
                <div key={portage.id} className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {portage.name}
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Platform Services */}
      {formData.selectedPlatformServices.length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Services plateforme ({formData.selectedPlatformServices.length})</h4>
          <div className="space-y-3">
            {formData.selectedPlatformServices.map((serviceId: string) => {
              const service = platformServices?.find(s => s.id.toString() === serviceId);
              return service ? (
                <div key={service.id} className="flex items-start space-x-3">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{service.label}</h5>
                    {service.description && (
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    )}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* New Services */}
      {formData.newServices.filter((s: NewService) => s.label.trim() !== '').length > 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">
            Nouveaux services ({formData.newServices.filter((s: NewService) => s.label.trim() !== '').length})
          </h4>
          <div className="space-y-4">
            {formData.newServices
              .filter((s: NewService) => s.label.trim() !== '')
              .map((service: NewService) => (
                <div key={service.id} className="border-l-4 border-blue-500 pl-4">
                  <h5 className="font-medium text-gray-900">{service.label}</h5>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Type: {service.dataType} | Données requises: {service.requiresData ? 'Oui' : 'Non'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
