
interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export default function OnboardingProgress({ currentStep, totalSteps, stepNames }: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-900">온보딩 진행률</h2>
        <span className="text-sm text-gray-500">{currentStep} / {totalSteps}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-600">
        {stepNames.map((stepName, index) => (
          <div 
            key={index}
            className={`text-center ${index < currentStep ? 'text-indigo-600 font-medium' : ''}`}
          >
            <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${
              index < currentStep ? 'bg-indigo-600' : 'bg-gray-300'
            }`}></div>
            {stepName}
          </div>
        ))}
      </div>
    </div>
  );
}