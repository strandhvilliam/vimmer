import { STEPS } from "@/lib/constants";
import { CheckIcon } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  currentStep: number;
  handleSetStep: (s: number) => void;
}

export function StepNavigator({ currentStep, handleSetStep }: Props) {
  return (
    <nav className="mb-8">
      <ol className="flex items-center justify-between">
        {Object.values(STEPS).map((step) => (
          <li
            key={step}
            className={`flex items-center ${step !== STEPS.UploadSubmissionStep ? "flex-1" : ""} `}
          >
            <motion.span
              onClick={() => handleSetStep(step)}
              initial={false}
              animate={{
                scale: step >= currentStep ? 1.1 : 1,
                backgroundColor:
                  step >= currentStep
                    ? "hsl(240 5.9% 10%)"
                    : "hsl(240 4.8% 95.9%)",
                color:
                  step >= currentStep ? "hsl(0 0% 98%)" : "hsl(240 3.8% 46.1%)",
              }}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:cursor-pointer"
              transition={{ duration: 0.2 }}
            >
              {currentStep < step ? <CheckIcon size={18} /> : currentStep}
            </motion.span>
            {currentStep !== 4 && (
              <motion.div
                initial={false}
                animate={{
                  backgroundColor:
                    step > currentStep
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
