"use client";
import { AnimatePresence, motion } from "motion/react";
import { parseAsInteger, useQueryState } from "nuqs";
import { AnimatedStepWrapper } from "./components/animated-step-wrapper";
import { CompetitionClassSelection } from "./components/class-step";
import { DeviceGroupSelection } from "./components/device-step";
import ParticipantRegistration from "./components/participant-step";
import { SubmitSubmissions } from "./components/submit-step";
import { useState } from "react";

export function SubmissionClientPage() {
  const [step, setStep] = useQueryState(
    "step",
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <nav className="mb-8">
        <ol className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNumber) => (
            <li
              key={stepNumber}
              className={`flex items-center ${
                stepNumber !== 4 ? "flex-1" : ""
              }`}
            >
              <motion.span
                initial={false}
                animate={{
                  scale: step >= stepNumber ? 1.1 : 1,
                  backgroundColor:
                    step >= stepNumber
                      ? "hsl(240 5.9% 10%)"
                      : "hsl(240 4.8% 95.9%)",
                  color:
                    step >= stepNumber
                      ? "hsl(0 0% 98%)"
                      : "hsl(240 3.8% 46.1%)",
                }}
                className="flex items-center justify-center w-8 h-8 rounded-full"
                transition={{ duration: 0.2 }}
              >
                {stepNumber}
              </motion.span>
              {stepNumber !== 4 && (
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor:
                      step > stepNumber
                        ? "hsl(240 5.9% 10%)"
                        : "hsl(240 4.8% 95.9%)",
                  }}
                  className="flex-1 h-px mx-2"
                  transition={{ duration: 0.2 }}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        {step === 1 && (
          <AnimatedStepWrapper key="step1" direction={direction}>
            <ParticipantRegistration onNextStep={handleNextStep} />
          </AnimatedStepWrapper>
        )}
        {step === 2 && (
          <AnimatedStepWrapper key="step2" direction={direction}>
            <CompetitionClassSelection
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
            />
          </AnimatedStepWrapper>
        )}
        {step === 4 && (
          <AnimatedStepWrapper key="step4" direction={direction}>
            <SubmitSubmissions onPrevStep={handlePrevStep} />
          </AnimatedStepWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
