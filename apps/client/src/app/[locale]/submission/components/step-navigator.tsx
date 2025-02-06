import { CheckIcon } from "lucide-react";
import { motion } from "motion/react";

export function StepNavigator({
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
