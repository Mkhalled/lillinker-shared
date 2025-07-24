'use client';

interface StepContentProps {
  stepTitle: string;
  stepDescription: string;
  error?: string | null;
  children: React.ReactNode;
}

export const StepContent = ({ 
  stepTitle, 
  stepDescription, 
  error, 
  children 
}: StepContentProps) => {
  return (
    <>
      {/* Step Title and Description */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{stepTitle}</h2>
        <p className="text-gray-600">{stepDescription}</p>
      </div>

      {/* Content */}
      <div className="mb-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        {children}
      </div>
    </>
  );
};
