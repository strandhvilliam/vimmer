"use client";

import { OnboardingWelcomeStep } from "@/components/admin/onboarding-welcome-step";
import { OnboardingConfigStep } from "@/components/admin/onboarding-config-step";
import { OnboardingRulesStep } from "@/components/admin/onboarding-rules-step";
import { OnboardingClassStep } from "@/components/admin/onboarding-class-step";
import { OnboardingDeviceStep } from "@/components/admin/onboarding-device-step";
import { OnboardingTopicsStep } from "@/components/admin/onboarding-topics-step";
import { OnboardingSummaryStep } from "@/components/admin/onboarding-summary-step";
import { CheckIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@vimmer/ui/lib/utils";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { createParser, useQueryState } from "nuqs";

const STEPS = {
  WelcomeStep: 1,
  MarathonConfigStep: 2,
  ValidationRulesStep: 3,
  TopicsStep: 4,
  CompetitionClassStep: 5,
  DeviceGroupStep: 6,
  SummaryStep: 7,
} as const;

type StepNumber = (typeof STEPS)[keyof typeof STEPS];

const parseAsStep = createParser<StepNumber>({
  parse(queryValue) {
    const num = Number(queryValue);
    const validSteps = Object.values(STEPS) as number[];
    if (validSteps.includes(num)) {
      return num as StepNumber;
    }
    return null;
  },
  serialize(value) {
    return String(value);
  },
});

const STEP_LABELS: Record<StepNumber, string> = {
  [STEPS.WelcomeStep]: "Welcome",
  [STEPS.MarathonConfigStep]: "Configuration",
  [STEPS.ValidationRulesStep]: "Rules",
  [STEPS.TopicsStep]: "Topics",
  [STEPS.CompetitionClassStep]: "Classes",
  [STEPS.DeviceGroupStep]: "Devices",
  [STEPS.SummaryStep]: "Summary",
} as const;

interface OnboardingFlowProps {
  marathonSettingsRouterUrl: string;
}

export function OnboardingFlow({
  marathonSettingsRouterUrl,
}: OnboardingFlowProps) {
  const { domain } = useDomain();
  const [currentStep, setCurrentStep] = useQueryState<StepNumber>(
    "step",
    parseAsStep.withDefault(STEPS.WelcomeStep),
  );
  const trpc = useTRPC();

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
  );

  const stepNumbers = Object.values(STEPS) as StepNumber[];

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
    <>
      <DotPattern />
      <div className="min-h-screen bg-gradient-to-br ">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-12">
            <ol className="flex items-center mx-auto max-w-4xl">
              {stepNumbers.map((step) => (
                <li
                  key={step}
                  className={cn(
                    "flex flex-col",
                    step !== STEPS.SummaryStep && "flex-1",
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
                          : "hover:shadow-md",
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
                          : "text-muted-foreground",
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
            {currentStep === STEPS.WelcomeStep && (
              <OnboardingWelcomeStep
                onNext={nextStep}
                onPrev={prevStep}
                canGoBack={canGoBack}
                isLastStep={isLastStep}
              />
            )}
            {currentStep === STEPS.MarathonConfigStep && (
              <OnboardingConfigStep
                marathon={marathon}
                onNext={nextStep}
                onPrev={prevStep}
                canGoBack={canGoBack}
                isLastStep={isLastStep}
                marathonSettingsRouterUrl={marathonSettingsRouterUrl}
              />
            )}
            {currentStep === STEPS.ValidationRulesStep && (
              <OnboardingRulesStep
                onNext={nextStep}
                onPrev={prevStep}
                canGoBack={canGoBack}
                isLastStep={isLastStep}
              />
            )}
            {currentStep === STEPS.TopicsStep && (
              <OnboardingTopicsStep
                onNext={nextStep}
                onPrev={prevStep}
                canGoBack={canGoBack}
                isLastStep={isLastStep}
              />
            )}
            {currentStep === STEPS.CompetitionClassStep && (
              <OnboardingClassStep
                onNext={nextStep}
                onPrev={prevStep}
                canGoBack={canGoBack}
                isLastStep={isLastStep}
              />
            )}
            {currentStep === STEPS.DeviceGroupStep && (
              <OnboardingDeviceStep
                onNext={nextStep}
                onPrev={prevStep}
                canGoBack={canGoBack}
                isLastStep={isLastStep}
              />
            )}
            {currentStep === STEPS.SummaryStep && (
              <OnboardingSummaryStep
                marathon={marathon}
                onNext={nextStep}
                onPrev={prevStep}
                canGoBack={canGoBack}
                isLastStep={isLastStep}
              />
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
