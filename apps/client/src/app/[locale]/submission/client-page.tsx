"use client";
import { AnimatedStepWrapper } from "@/components/animated-step-wrapper";
import { ClassSelectionStep } from "@/app/[locale]/submission/steps/class-selection-step";
import { DeviceSelectionStep } from "@/app/[locale]/submission/steps/device-selection-step";
import { ParticipantNumberStep } from "@/app/[locale]/submission/steps/participant-number-step";
import { ParticipantDetailsStep } from "@/app/[locale]/submission/steps/participant-details-step";
import { StepNavigator } from "@/components/step-navigator";
import { UploadSubmissionsStep } from "@/app/[locale]/submission/steps/upload-submissions-step";
import { STEPS } from "@/lib/constants";
import {
  CompetitionClass,
  DeviceGroup,
  Marathon,
  Topic,
} from "@vimmer/supabase/types";
import { AnimatePresence } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import {
  submissionQueryClientParams,
  submissionQueryClientParamSerializer,
} from "@/schemas/submission-query-client-schema";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";

interface ClientPageProps {
  marathon: Marathon;
  topics: Topic[];
  competitionClasses: CompetitionClass[];
  deviceGroups: DeviceGroup[];
}

export function SubmissionClientPage({
  marathon,
  topics,
  competitionClasses,
  deviceGroups,
}: ClientPageProps) {
  const [step, setStep] = useQueryState(
    "s",
    parseAsInteger.withDefault(1).withOptions({ history: "push" })
  );
  const { submissionState } = useSubmissionQueryState();
  const [direction, setDirection] = useState(0);
  const router = useRouter();
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
    <div className="max-w-2xl mx-auto p-4">
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
              marathonId={marathon.id}
              domain={marathon.domain}
              onNextStep={handleNextStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.ParticipantDetailsStep && (
          <AnimatedStepWrapper
            key={STEPS.ParticipantDetailsStep}
            direction={direction}
          >
            <ParticipantDetailsStep
              marathonId={marathon.id}
              domain={marathon.domain}
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
              onPrevStep={handlePrevStep}
              onNextStep={handleNavigateToVerification}
            />
          </AnimatedStepWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
