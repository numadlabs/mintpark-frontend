import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
  completed: boolean;
  active: boolean;
}

interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps: Step[] = [
    {
      number: 1,
      title: "Deploy Contract",
      completed: currentStep > 1,
      active: currentStep === 1,
    },
    {
      number: 2,
      title: "Upload Traits",
      completed: currentStep > 2,
      active: currentStep === 2,
    },
    {
      number: 3,
      title: "Inscribe",
      completed: currentStep > 3,
      active: currentStep === 3,
    },
  ];

  return (
    <div className="flex items-center justify-center gap-4">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center gap-2">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${step.completed
                  ? 'bg-white text-black'
                  : step.active
                  ? 'bg-white text-black'
                  : 'bg-transLight12 text-lightSecondary'
                }
              `}
            >
              {step.completed ? (
                <Check size={16} />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`
                text-sm font-medium
                ${step.completed || step.active
                  ? 'text-white'
                  : 'text-lightSecondary'
                }
              `}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`
                w-8 h-0.5
                ${step.completed
                  ? 'bg-white'
                  : 'bg-transLight12'
                }
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}