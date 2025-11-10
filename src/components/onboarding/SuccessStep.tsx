'use client';

import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SuccessStepProps {
  email?: string;
  title?: string;
  message?: string;
  steps?: string[];
}

export const SuccessStep = ({ email, title, message, steps }: SuccessStepProps) => {
  const t = useTranslations('onboarding.success');

  const defaultSteps = [t('step1'), t('step2'), t('step3'), t('step4'), t('step5')];

  return (
    <div className="space-y-6 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title || t('title')}</h3>
        <p className="text-gray-600 mb-4">{message || t('message', { email: email || '' })}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h4 className="font-medium text-blue-900 mb-2">{t('nextSteps')}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {(steps || defaultSteps).map((step, index) => (
              <li key={index}>• {step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
