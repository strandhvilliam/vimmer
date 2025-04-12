import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { ValidationResult, VALIDATION_OUTCOME } from "@vimmer/validation";
import { motion } from "framer-motion";

interface GroupValidationStatusProps {
  results: ValidationResult[];
}

export function GroupValidationStatus({ results }: GroupValidationStatusProps) {
  // Filter out PASSED validations, only show FAILED and SKIPPED
  const relevantResults = results.filter(
    (result) => result.outcome !== VALIDATION_OUTCOME.PASSED
  );

  if (!relevantResults.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-4 mb-2 space-y-2"
    >
      <h3 className="text-sm font-medium">Collection Validations</h3>
      <div className="space-y-2">
        {relevantResults.map((result, index) => (
          <motion.div
            key={`group-validation-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg flex items-start gap-2 ${
              result.outcome === VALIDATION_OUTCOME.FAILED
                ? result.severity === "error"
                  ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            {result.outcome === VALIDATION_OUTCOME.FAILED ? (
              result.severity === "error" ? (
                <AlertCircle className="h-5 w-5 shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0" />
              )
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 opacity-60" />
            )}
            <div>
              <p className="text-sm font-medium">
                {formatRuleKey(result.ruleKey)}
              </p>
              <p className="text-xs">{result.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function formatRuleKey(key: string): string {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
