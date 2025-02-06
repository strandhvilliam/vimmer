"use client";
import {
  CompetitionClass,
  DeviceGroup,
  Marathon,
  Topic,
} from "@vimmer/supabase/types";
import { CheckIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { AnimatedStepWrapper } from "./components/animated-step-wrapper";
import { CompetitionClassSelection } from "./components/class-step";
import { DeviceGroupSelection } from "./components/device-step";
import ParticipantRegistration from "./components/participant-step";
import { UploadSubmissions } from "./components/upload-step";

export interface StepNavigationHandlers {
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

type Props = {
  marathon: Marathon & {
    competitionClasses: CompetitionClass[];
    deviceGroups: DeviceGroup[];
    topics: Topic[];
  };
};

export function SubmissionClientPage({ marathon }: Props) {
  const [step, setStep] = useQueryState(
    "s",
    parseAsInteger.withDefault(1).withOptions({ history: "push" }),
  );
  const [direction, setDirection] = useState(0);

  const handleNextStep = () => {
    const nextStep = Math.min(step + 1, 4);
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <StepNavigator handleSetStep={(s) => handleSetStep(s)} step={step} />
      <AnimatePresence initial={false} custom={direction} mode="wait">
        {step === 1 && (
          <AnimatedStepWrapper key="step1" direction={direction}>
            <ParticipantRegistration
              marathonId={marathon.id}
              onNextStep={handleNextStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === 2 && (
          <AnimatedStepWrapper key="step2" direction={direction}>
            <CompetitionClassSelection
              competitionClasses={marathon.competitionClasses}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === 3 && (
          <AnimatedStepWrapper key="step3" direction={direction}>
            <DeviceGroupSelection
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              deviceGroups={marathon.deviceGroups}
            />
          </AnimatedStepWrapper>
        )}
        {step === 4 && (
          <AnimatedStepWrapper key="step4" direction={direction}>
            <UploadSubmissions
              // add configuration from marathon
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

function StepNavigator({
  step,
  handleSetStep,
}: {
  step: number;
  handleSetStep: (s: number) => void;
}) {
  return (
    <nav className="mb-8">
      <ol className="flex items-center justify-between">
        {[1, 2, 3, 4].map((stepNumber) => (
          <li
            key={stepNumber}
            className={`flex items-center ${stepNumber !== 4 ? "flex-1" : ""} `}
          >
            <motion.span
              onClick={() => handleSetStep(stepNumber)}
              initial={false}
              animate={{
                scale: step >= stepNumber ? 1.1 : 1,
                backgroundColor:
                  step >= stepNumber
                    ? "hsl(240 5.9% 10%)"
                    : "hsl(240 4.8% 95.9%)",
                color:
                  step >= stepNumber ? "hsl(0 0% 98%)" : "hsl(240 3.8% 46.1%)",
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:cursor-pointer"
              transition={{ duration: 0.2 }}
            >
              {stepNumber < step ? <CheckIcon size={18} /> : stepNumber}
            </motion.span>
            {stepNumber !== 4 && (
              <motion.div
                initial={false}
                animate={{
                  backgroundColor:
                    step > stepNumber
                      ? "hsl(240 5.9% 8%)"
                      : "hsl(240 4.8% 90%)",
                }}
                className="flex-1 h-px mx-2"
                transition={{ duration: 0.2 }}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
