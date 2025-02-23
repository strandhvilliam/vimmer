"use client";
import { AnimatedStepWrapper } from "@/components/animated-step-wrapper";
import { ClassSelectionStep } from "@/components/class-selection-step";
import { DeviceSelectionStep } from "@/components/device-selection-step";
import { ParticipantRegistrationStep } from "@/components/participant-registration-step";
import { StepNavigator } from "@/components/step-navigator";
import { UploadSubmissionsStep } from "@/components/upload-submissions-step";
import { STEPS } from "@/lib/constants";
import {
  CompetitionClass,
  DeviceGroup,
  Marathon,
  Topic,
} from "@vimmer/supabase/types";
import { AnimatePresence } from "motion/react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useEffect, useState } from "react";

interface Props {
  marathon: Marathon & {
    competitionClasses: CompetitionClass[];
    deviceGroups: DeviceGroup[];
    topics: Topic[];
  };
}

export function SubmissionClientPage({ marathon }: Props) {
  const [step, setStep] = useQueryState(
    "s",
    parseAsInteger.withDefault(1).withOptions({ history: "push" }),
  );
  const [direction, setDirection] = useState(0);

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

  const handleSetStep = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  useEffect(() => {
    const unloadCallback = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      return "";
    };

    window.addEventListener("beforeunload", unloadCallback);
    return () => window.removeEventListener("beforeunload", unloadCallback);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <StepNavigator
        handleSetStep={(s) => handleSetStep(s)}
        currentStep={step}
      />
      <AnimatePresence initial={false} custom={direction} mode="wait">
        {step === STEPS.ParticipantRegistrationStep && (
          <AnimatedStepWrapper direction={direction}>
            <ParticipantRegistrationStep
              marathonId={marathon.id}
              onNextStep={handleNextStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.ClassSelectionStep && (
          <AnimatedStepWrapper direction={direction}>
            <ClassSelectionStep
              competitionClasses={marathon.competitionClasses}
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
              deviceGroups={marathon.deviceGroups}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.UploadSubmissionStep && (
          <AnimatedStepWrapper direction={direction}>
            <UploadSubmissionsStep
              marathonDomain={marathon.domain}
              competitionClasses={marathon.competitionClasses}
              topics={marathon.topics}
              onPrevStep={handlePrevStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === STEPS.VerificationStep && (
          <AnimatedStepWrapper direction={direction}>
            <UploadSubmissionsStep
              marathonDomain={marathon.domain}
              competitionClasses={marathon.competitionClasses}
              topics={marathon.topics}
              onPrevStep={handlePrevStep}
            />
          </AnimatedStepWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
