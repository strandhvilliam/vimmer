"use client";
import { AnimatedStepWrapper } from "@/components/steps/animated-step-wrapper";
import { ClassSelectionStep } from "@/components/steps/class-selection-step";
import { DeviceSelectionStep } from "@/components/steps/device-selection-step";
import { ParticipantNumberStep } from "@/components/steps/participant-number-step";
import { ParticipantDetailsStep } from "@/components/steps/participant-details-step";
import { StepNavigator } from "@/components/step-navigator";
import { UploadSubmissionsStep } from "@/components/steps/upload-submissions-step";
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
} from "@/lib/schemas/submission-query-client-schema";
import { useSubmissionQueryState } from "@/lib/hooks/use-submission-query-state";

interface Props {
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
}: Props) {
  const [step, setStep] = useQueryState(
    "s",
    parseAsInteger.withDefault(1).withOptions({ history: "push" })
  );
  const { submissionState } = useSubmissionQueryState();
  const [direction, setDirection] = useState(0);
  const pathname = usePathname();
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
      {/* <StepNavigator
        handleSetStep={(s) => handleSetStep(s)}
        currentStep={step}
      /> */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        {step === STEPS.ParticipantNumberStep && (
          <AnimatedStepWrapper direction={direction}>
            <ParticipantNumberStep
              marathonId={marathon.id}
              domain={marathon.domain}
              onNextStep={handleNextStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.ParticipantDetailsStep && (
          <AnimatedStepWrapper direction={direction}>
            <ParticipantDetailsStep
              marathonId={marathon.id}
              domain={marathon.domain}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.ClassSelectionStep && (
          <AnimatedStepWrapper direction={direction}>
            <ClassSelectionStep
              competitionClasses={competitionClasses}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.DeviceSelectionStep && (
          <AnimatedStepWrapper direction={direction}>
            <DeviceSelectionStep
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              deviceGroups={deviceGroups}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.UploadSubmissionStep && (
          <AnimatedStepWrapper direction={direction}>
            <UploadSubmissionsStep
              domain={marathon.domain}
              competitionClasses={competitionClasses}
              topics={topics}
              onPrevStep={handlePrevStep}
              onNextStep={handleNavigateToVerification}
            />
          </AnimatedStepWrapper>
        )}
        {/* {step === STEPS.VerificationStep && (
          <AnimatedStepWrapper direction={direction}>
            <UploadSubmissionsStep
              marathonDomain={marathon.domain}
              competitionClasses={competitionClasses}
              topics={topics}
              onPrevStep={handlePrevStep}
            />
          </AnimatedStepWrapper>
        )} */}
      </AnimatePresence>
    </div>
  );
}
