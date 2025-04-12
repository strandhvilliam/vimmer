"use client";

import { useSubmissionQueryState } from "@/lib/hooks/use-submission-query-state";
import { StepNavigationHandlers } from "@/lib/types";
import { CompetitionClass } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@vimmer/ui/lib/utils";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

interface Props extends StepNavigationHandlers {
  competitionClasses: CompetitionClass[];
}

export function ClassSelectionStep({
  competitionClasses,
  onNextStep,
  onPrevStep,
}: Props) {
  const {
    submissionState: { competitionClassId },
    setSubmissionState,
  } = useSubmissionQueryState();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
          Choose Your Challenge
        </CardTitle>
        <CardDescription className="text-center">
          Select the competition class that matches your endurance goals
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap justify-center gap-4">
        {competitionClasses.map((cc) => (
          <CompetitionClassItem
            key={cc.id}
            competitionClass={cc}
            isSelected={cc.id === competitionClassId}
            onSelect={() => setSubmissionState({ competitionClassId: cc.id })}
          />
        ))}
      </CardContent>

      <CardFooter className="w-full px-4 flex flex-col gap-4 items-center justify-center">
        <PrimaryButton
          onClick={onNextStep}
          disabled={!competitionClassId}
          className="w-full py-3 text-lg rounded-full"
        >
          Continue
        </PrimaryButton>
        <Button
          variant="ghost"
          size="lg"
          onClick={onPrevStep}
          disabled={!competitionClassId}
          className="w-[200px]"
        >
          Back
        </Button>
      </CardFooter>
    </div>
  );
}

export function CompetitionClassItem({
  competitionClass,
  isSelected,
  onSelect,
}: {
  competitionClass: CompetitionClass;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      key={competitionClass.id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full md:w-[380px]"
    >
      <Card
        className={cn(
          "relative cursor-pointer h-full overflow-hidden transition-all duration-200",
          isSelected && "ring-2 ring-primary/20 shadow-lg"
        )}
        onClick={onSelect}
      >
        <motion.div
          className="flex"
          animate={{
            backgroundColor: isSelected
              ? "rgba(var(--primary), 0.03)"
              : "transparent",
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={cn(
              "flex items-center justify-center w-24 h-24 p-4 m-4 text-center rounded-lg",
              isSelected ? "bg-primary/10" : "bg-muted/50"
            )}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.span
              className={cn(
                "text-5xl font-bold",
                isSelected ? "text-primary" : "text-foreground/80"
              )}
              layout
              transition={{ duration: 0.2 }}
            >
              {competitionClass.numberOfPhotos}
            </motion.span>
          </motion.div>

          <div className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="text-xl">{competitionClass.name}</span>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isSelected ? 1 : 0,
                    opacity: isSelected ? 1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </motion.div>
              </CardTitle>
            </CardHeader>

            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                {competitionClass.numberOfPhotos === 1
                  ? "1 photo"
                  : `${competitionClass.numberOfPhotos} photos`}
              </p>
              {competitionClass.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {competitionClass.description}
                </p>
              )}
            </CardContent>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
