"use client";

import { CompetitionClassItem } from "@/components/competition-class-item";
import { useSubmissionQueryState } from "@/lib/hooks/use-submission-query-state";
import { StepNavigationHandlers } from "@/lib/types";
import { CompetitionClass } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";

interface Props extends StepNavigationHandlers {
  competitionClasses: CompetitionClass[];
}

export function ClassSelectionStep({
  competitionClasses,
  onNextStep,
  onPrevStep,
}: Props) {
  const {
    params: { competitionClassId },
    setParams,
  } = useSubmissionQueryState();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Choose Your Challenge</h1>
        <p className="text-muted-foreground">
          Select the competition class that matches your endurance goals
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {competitionClasses.map((cc) => (
          <CompetitionClassItem
            key={cc.id}
            competitionClass={cc}
            isSelected={cc.id === competitionClassId}
            onSelect={() => setParams({ competitionClassId: cc.id })}
          />
        ))}
      </div>

      <div className="w-full flex flex-col gap-4 items-center justify-center">
        <Button
          size="lg"
          onClick={onNextStep}
          disabled={!competitionClassId}
          className="w-[200px]"
        >
          Continue
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={onPrevStep}
          disabled={!competitionClassId}
          className="w-[200px]"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
