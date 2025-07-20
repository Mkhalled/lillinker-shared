'use client';

import { CheckCircle } from 'lucide-react';

interface SuccessStepProps {
  email: string;
  title?: string;
  message?: string;
  steps?: string[];
}

export const SuccessStep = ({
  email,
  title = "Vérifiez votre adresse email !",
  message,
  steps = [
    "Vérifiez votre boîte email (y compris les spams)",
    "Cliquez sur le lien de vérification",
    "Définissez votre mot de passe",
    "Attendez la validation par notre équipe (2-3 jours ouvrés)",
    "Accès complet à la plateforme après validation"
  ]
}: SuccessStepProps) => {
  const defaultMessage = `Un email de vérification a été envoyé à ${email}. Cliquez sur le lien dans l'email pour vérifier votre adresse et définir votre mot de passe.`;

  return (
    <div className="space-y-6 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 mb-4">
          <strong>{email}</strong>
          {message || defaultMessage}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h4 className="font-medium text-blue-900 mb-2">Prochaines étapes :</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {steps.map((step, index) => (
              <li key={index}>• {step}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
