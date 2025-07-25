'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button/Button';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { StyledCheckbox } from '@/components/form/StyledCheckbox';
import type { PlatformService } from '@/hooks/useModalData';
import type { CompanyFormData } from '@/types/company';
import type { NewService } from '@/types/user';

import ServiceInfoTooltip from '../../ServiceInfoTooltip';

interface CompanyServicesStepProps {
  formData: CompanyFormData;
  onFormDataChange: (updates: Partial<CompanyFormData>) => void;
  platformServices: PlatformService[];
  onAddNewService: () => void;
}

export const CompanyServicesStep = ({ 
  formData, 
  onFormDataChange, 
  platformServices,
  onAddNewService
}: CompanyServicesStepProps) => {
  const toggleServiceSelection = (serviceId: number) => {
    const serviceIdStr = serviceId.toString();
    const newSelectedServices = formData.selectedPlatformServices.includes(serviceIdStr)
      ? formData.selectedPlatformServices.filter((id: string) => id !== serviceIdStr)
      : [...formData.selectedPlatformServices, serviceIdStr];
    
    onFormDataChange({ selectedPlatformServices: newSelectedServices });
  };

  const removeService = (index: number) => {
    const newServices = formData.newServices.filter((_, i) => i !== index);
    onFormDataChange({ newServices });
  };

  const clearAllServices = () => {
    onFormDataChange({ newServices: [] });
  };

  return (
    <div className="space-y-6">
      {/* Existing Platform Services */}
      <CollapsibleSection
        title="Services disponibles sur la plateforme"
        items={platformServices}
        selectedItems={formData.selectedPlatformServices}
        onToggleItem={toggleServiceSelection}
        getItemId={(service: PlatformService) => service.id}
        renderItem={(service: PlatformService, isSelected: boolean) => (
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h5 className="font-medium text-gray-900">{service.label}</h5>
                <div onClick={(e) => e.stopPropagation()}>
                  <ServiceInfoTooltip service={service} />
                </div>
              </div>
              {service.user?.ownedCompany && (
                <p className="text-xs text-gray-500 mt-1">
                  Par {service.user.ownedCompany.name}
                </p>
              )}
            </div>
            <div className="ml-3">
              <StyledCheckbox
                checked={isSelected}
                onChange={() => toggleServiceSelection(service.id)}
                size="sm"
              />
            </div>
          </div>
        )}
        loadingText="Aucun service disponible pour le moment"
        emptyStateText="Aucun service disponible pour le moment"
        showItemCount={true}
      />

      {/* Create New Service Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-gray-900">Créer des nouveaux services</h4>
            {formData.newServices.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {formData.newServices.length} service{formData.newServices.length > 1 ? 's' : ''} créé{formData.newServices.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddNewService}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau service</span>
          </Button>
        </div>

        {formData.newServices.length > 0 && (
          <div className="space-y-3">
            {formData.newServices.map((service: NewService, index: number) => (
              <div key={service.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Nouveau
                      </span>
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1">
                      {service.label}
                    </h5>
                    {service.description && (
                      <p className="text-sm text-gray-600">{service.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeService(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium ml-4 px-2 py-1 rounded hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <button
                onClick={clearAllServices}
                className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
              >
                Tout supprimer ({formData.newServices.length} service{formData.newServices.length > 1 ? 's' : ''})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
