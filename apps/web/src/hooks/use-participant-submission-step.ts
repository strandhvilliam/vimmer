import { PARTICIPANT_SUBMISSION_STEPS } from "@/lib/constants";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";

export function useParticipantSubmissionStep() {
  const [step, setStep] = useQueryState(
    "s",
    parseAsInteger.withDefault(1).withOptions({ history: "push" }),
  );
  const [direction, setDirection] = useState(0);

  const handleNextStep = () => {
    const nextStep = Math.min(
      step + 1,
      Object.keys(PARTICIPANT_SUBMISSION_STEPS).length,
    );
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

  return { step, direction, handleNextStep, handlePrevStep, handleSetStep };
}
