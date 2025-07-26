'use client';

interface StepContentProps {
  stepTitle: string;
  stepDescription: string;
  error?: string | null;
  children: React.ReactNode;
}

export const StepContent = ({ stepTitle, stepDescription, error, children }: StepContentProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Step Title and Description */}
      <div className="mb-4 sm:mb-6 flex-shrink-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{stepTitle}</h2>
        <p className="text-sm sm:text-base text-gray-600">{stepDescription}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex-shrink-0"
          role="alert"
        >
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Content - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
};
