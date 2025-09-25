"use client";

interface StepCardProps {
  step: {
    step: number;
    title: string;
    description: string;
    example?: string;
  };
  totalSteps: number;
}

export function StepCard({ step, totalSteps }: StepCardProps) {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-quest-blue-400 to-quest-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {step.step}
        </div>
      </div>
      
      <div className="mb-2">
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Step {step.step} of {totalSteps}
        </span>
      </div>
      
      <h4 className="text-lg font-semibold text-gray-900 mb-3">
        {step.title}
      </h4>
      
      <p className="text-gray-700 leading-relaxed mb-4">
        {step.description}
      </p>
      
      {step.example && (
        <div className="bg-quest-blue-50 rounded-game p-4 border border-quest-blue-200">
          <p className="text-sm font-semibold text-quest-blue-800 mb-2">Example:</p>
          <p className="text-sm text-quest-blue-700">{step.example}</p>
        </div>
      )}
    </div>
  );
}