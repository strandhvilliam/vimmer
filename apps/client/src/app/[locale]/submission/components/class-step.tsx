"use client";

import { CompetitionClass } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { StepNavigationHandlers } from "../client-page";

interface ClassSelectionClientProps extends StepNavigationHandlers {
  competitionClasses: CompetitionClass[];
}

export function CompetitionClassSelection({
  competitionClasses,
  onNextStep,
  onPrevStep,
}: ClassSelectionClientProps) {
  const [selectedClass, setSelectedClass] = useQueryState("cc", parseAsInteger);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Choose Your Challenge</h1>
        <p className="text-muted-foreground">
          Select the competition class that matches your endurance goals
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {competitionClasses.map((competitionClass) => (
          <motion.div
            key={competitionClass.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-[300px]"
          >
            <Card
              className={`cursor-pointer transition-colors h-full ${
                selectedClass === competitionClass.id
                  ? "border-2 border-primary"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedClass(competitionClass.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {competitionClass.name}
                  {selectedClass === competitionClass.id && (
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {competitionClass.numberOfPhotos} photos
                </p>
              </CardHeader>
              <CardFooter className="mt-auto">
                <span className="text-xs text-muted-foreground ml-auto">
                  ID: {competitionClass.id}
                </span>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="w-full flex flex-col gap-4 items-center justify-center">
        <Button
          size="lg"
          onClick={onNextStep}
          disabled={!selectedClass}
          className="w-[200px]"
        >
          Continue
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={onPrevStep}
          disabled={!selectedClass}
          className="w-[200px]"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
