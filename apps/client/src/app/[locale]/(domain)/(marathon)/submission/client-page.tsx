"use client";
import { AnimatedStepWrapper } from "@/components/animated-step-wrapper";
import { ClassSelectionStep } from "./_components/class-selection-step";
import { DeviceSelectionStep } from "./_components/device-selection-step";
import { ParticipantNumberStep } from "./_components/participant-number-step";
import { ParticipantDetailsStep } from "./_components/participant-details-step";
import { StepNavigator } from "@/components/step-navigator";
import { UploadSubmissionsStep } from "./_components/upload-submissions-step";
import { STEPS } from "@/lib/constants";
import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { submissionQueryClientParamSerializer } from "@/lib/schemas/submission-query-client-schema";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { mapDbRuleConfigsToValidationConfigs } from "@/lib/utils";

export function SubmissionClientPage() {
  const trpc = useTRPC();
  const router = useRouter();
  const [step, setStep] = useQueryState(
    "s",
    parseAsInteger.withDefault(1).withOptions({ history: "push" })
  );
  const [direction, setDirection] = useState(0);
  const { submissionState } = useSubmissionQueryState();

  const { domain } = useDomain();

  const [
    { data: marathon },
    { data: competitionClasses },
    { data: deviceGroups },
    { data: ruleConfigs },
    { data: topics },
  ] = useSuspenseQueries({
    queries: [
      trpc.marathons.getByDomain.queryOptions({ domain }),
      trpc.competitionClasses.getByDomain.queryOptions({
        domain,
      }),
      trpc.deviceGroups.getByDomain.queryOptions({
        domain,
      }),
      trpc.rules.getByDomain.queryOptions({
        domain,
      }),
      trpc.topics.getByDomain.queryOptions({
        domain,
      }),
    ],
  });

  const handleNextStep = () => {
    const nextStep = Math.min(step + 1, Object.keys(STEPS).length);
    setDirection(1);
    setStep(nextStep);
  };

  const handlePrevStep = () => {
    const prevStep = Math.max(step - 1, 1);
    setDirection(-1);
    setStep(prevStep);
  };

  const handleNavigateToVerification = () => {
    const params = submissionQueryClientParamSerializer(submissionState);
    router.push(`/verification${params}`);
  };

  const handleSetStep = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="mb-12 px-4 sm:px-0">
        <StepNavigator currentStep={step} handleSetStep={handleSetStep} />
      </div>
      <AnimatePresence initial={false} custom={direction} mode="wait">
        {step === STEPS.ParticipantNumberStep && (
          <AnimatedStepWrapper
            key={STEPS.ParticipantNumberStep}
            direction={direction}
          >
            <ParticipantNumberStep
              onNextStep={handleNextStep}
              marathon={marathon}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.ParticipantDetailsStep && (
          <AnimatedStepWrapper
            key={STEPS.ParticipantDetailsStep}
            direction={direction}
          >
            <ParticipantDetailsStep
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.ClassSelectionStep && (
          <AnimatedStepWrapper
            key={STEPS.ClassSelectionStep}
            direction={direction}
          >
            <ClassSelectionStep
              competitionClasses={competitionClasses}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.DeviceSelectionStep && (
          <AnimatedStepWrapper
            key={STEPS.DeviceSelectionStep}
            direction={direction}
          >
            <DeviceSelectionStep
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              deviceGroups={deviceGroups}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.UploadSubmissionStep && (
          <AnimatedStepWrapper
            key={STEPS.UploadSubmissionStep}
            direction={direction}
          >
            <UploadSubmissionsStep
              competitionClasses={competitionClasses}
              topics={topics}
              ruleConfigs={mapDbRuleConfigsToValidationConfigs(ruleConfigs)}
              onPrevStep={handlePrevStep}
              onNextStep={handleNavigateToVerification}
            />
          </AnimatedStepWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
