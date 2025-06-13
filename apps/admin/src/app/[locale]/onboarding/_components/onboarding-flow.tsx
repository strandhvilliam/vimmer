"use client";

import { useState } from "react";
import { WelcomeStep } from "./steps/welcome-step";
import { MarathonConfigStep } from "./steps/marathon-config-step";
import { ValidationRulesStep } from "./steps/validation-rules-step";
import { CompetitionClassStep } from "./steps/competition-class-step";
import { DeviceGroupStep } from "./steps/device-group-step";
import { SummaryStep } from "./steps/summary-step";
import { OnboardingProvider } from "./onboarding-context";
import { Marathon } from "@vimmer/supabase/types";
import { CheckIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@vimmer/ui/lib/utils";

interface OnboardingFlowProps {
  marathon: Marathon;
}

const STEPS = {
  WelcomeStep: 1,
  MarathonConfigStep: 2,
  ValidationRulesStep: 3,
  CompetitionClassStep: 4,
  DeviceGroupStep: 5,
  SummaryStep: 6,
} as const;

type StepNumber = (typeof STEPS)[keyof typeof STEPS];

const STEP_LABELS: Record<StepNumber, string> = {
  [STEPS.WelcomeStep]: "Welcome",
  [STEPS.MarathonConfigStep]: "Configuration",
  [STEPS.ValidationRulesStep]: "Rules",
  [STEPS.CompetitionClassStep]: "Classes",
  [STEPS.DeviceGroupStep]: "Devices",
  [STEPS.SummaryStep]: "Summary",
} as const;

const STEP_COMPONENTS: Record<
  StepNumber,
  { component: React.ComponentType<any>; title: string }
> = {
  [STEPS.WelcomeStep]: { component: WelcomeStep, title: "Welcome" },
  [STEPS.MarathonConfigStep]: {
    component: MarathonConfigStep,
    title: "Marathon Configuration",
  },
  [STEPS.ValidationRulesStep]: {
    component: ValidationRulesStep,
    title: "Validation Rules",
  },
  [STEPS.CompetitionClassStep]: {
    component: CompetitionClassStep,
    title: "Competition Classes",
  },
  [STEPS.DeviceGroupStep]: {
    component: DeviceGroupStep,
    title: "Device Groups",
  },
  [STEPS.SummaryStep]: { component: SummaryStep, title: "Summary" },
} as const;

export function OnboardingFlow({ marathon }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<StepNumber>(STEPS.WelcomeStep);

  const stepNumbers = Object.values(STEPS) as StepNumber[];
  const totalSteps = stepNumbers.length;
  const currentStepComponent = STEP_COMPONENTS[currentStep];

  const nextStep = () => {
    const currentIndex = stepNumbers.indexOf(currentStep);
    if (currentIndex < stepNumbers.length - 1) {
      const nextStepNumber = stepNumbers[currentIndex + 1];
      if (nextStepNumber) {
        setCurrentStep(nextStepNumber);
      }
    }
  };

  const prevStep = () => {
    const currentIndex = stepNumbers.indexOf(currentStep);
    if (currentIndex > 0) {
      const prevStepNumber = stepNumbers[currentIndex - 1];
      if (prevStepNumber) {
        setCurrentStep(prevStepNumber);
      }
    }
  };

  const handleSetStep = (stepNumber: StepNumber) => {
    if (stepNumber <= currentStep) {
      setCurrentStep(stepNumber);
    }
  };

  const isLastStep = currentStep === STEPS.SummaryStep;
  const canGoBack = currentStep > STEPS.WelcomeStep;

  return (
    <OnboardingProvider marathon={marathon}>
      {/* <></> */}
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-12">
            <ol className="flex items-center mx-auto max-w-4xl">
              {stepNumbers.map((step) => (
                <li
                  key={step}
                  className={cn(
                    "flex flex-col",
                    step !== STEPS.SummaryStep && "flex-1"
                  )}
                >
                  <div className="flex items-center w-full">
                    <motion.button
                      onClick={() => handleSetStep(step)}
                      initial={false}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{
                        scale: step <= currentStep ? 1 : 0.9,
                        backgroundColor:
                          step <= currentStep
                            ? "hsl(240 5.9% 10%)"
                            : "hsl(240 4.8% 95.9%)",
                        color:
                          step <= currentStep
                            ? "hsl(0 0% 98%)"
                            : "hsl(240 3.8% 46.1%)",
                      }}
                      className={cn(
                        "flex items-center justify-center rounded-full shrink-0",
                        "w-10 h-10 sm:w-12 sm:h-12",
                        "hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2",
                        "focus:ring-primary transition-shadow relative z-10 bg-background",
                        step <= currentStep ? "shadow-lg" : "",
                        step <= currentStep
                          ? "hover:shadow-xl"
                          : "hover:shadow-md"
                      )}
                      transition={{ duration: 0.2 }}
                      disabled={step > currentStep}
                    >
                      {currentStep > step ? (
                        <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      ) : (
                        <span className="text-sm sm:text-base font-semibold">
                          {step}
                        </span>
                      )}
                    </motion.button>
                    {step !== STEPS.SummaryStep && (
                      <div className="flex-1 relative">
                        <motion.div
                          initial={false}
                          animate={{
                            backgroundColor:
                              step < currentStep
                                ? "hsl(240 5.9% 10%)"
                                : "hsl(240 4.8% 90%)",
                          }}
                          className="absolute inset-0 mx-3 h-0.5 top-1/2 -translate-y-1/2 rounded-full"
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{
                      opacity: step <= currentStep ? 1 : 0.6,
                      y: 0,
                    }}
                    className="mt-3 text-center"
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium truncate max-w-[100px] block ",
                        step !== STEPS.SummaryStep
                          ? "-translate-x-6"
                          : "-translate-x-2",
                        step <= currentStep
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {STEP_LABELS[step]}
                    </span>
                  </motion.div>
                </li>
              ))}
            </ol>
          </nav>
          <motion.div
            key={currentStep + "content"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            {currentStepComponent && (
              <currentStepComponent.component
                onNext={nextStep}
                onPrev={prevStep}
                canGoBack={canGoBack}
                isLastStep={isLastStep}
              />
            )}
          </motion.div>
        </div>
      </div>
    </OnboardingProvider>
  );
}
