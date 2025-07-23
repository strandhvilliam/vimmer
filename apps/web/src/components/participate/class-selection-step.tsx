"use client";

import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { StepNavigationHandlers } from "@/lib/types";
import { Button } from "@vimmer/ui/components/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { CompetitionClass } from "@vimmer/api/db/types";
import { ClassSelectionItem } from "@/components/participate/class-selection-item";
import { useI18n } from "@/locales/client";

interface Props extends StepNavigationHandlers {
  competitionClasses: CompetitionClass[];
}

export function ClassSelectionStep({
  competitionClasses,
  onNextStep,
  onPrevStep,
}: Props) {
  const t = useI18n();
  const {
    submissionState: { competitionClassId },
  } = useSubmissionQueryState();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
          {t("classSelection.title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("classSelection.description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap justify-center gap-4">
        {competitionClasses.map((cc) => (
          <ClassSelectionItem
            key={cc.id}
            competitionClass={cc}
            isSelected={cc.id === competitionClassId}
          />
        ))}
      </CardContent>

      <CardFooter className="w-full px-4 flex flex-col gap-4 items-center justify-center">
        <PrimaryButton
          onClick={onNextStep}
          disabled={!competitionClassId}
          className="w-full py-3 text-lg rounded-full"
        >
          {t("classSelection.continue")}
        </PrimaryButton>
        <Button
          variant="ghost"
          size="lg"
          onClick={onPrevStep}
          className="w-[200px]"
        >
          {t("classSelection.back")}
        </Button>
      </CardFooter>
    </div>
  );
}
