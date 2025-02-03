"use client";

import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { on } from "events";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { Marathon } from "../page";

interface SubmissionNavigationProps {
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

interface ClassSelectionClientProps extends SubmissionNavigationProps {
  competitionClasses: Marathon["competitionClasses"];
}

export function CompetitionClassSelection({
  competitionClasses,
  onNextStep,
  onPrevStep,
}: ClassSelectionClientProps) {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useQueryState("cc", {
    defaultValue: "",
  });

  const handleContinue = () => {
    if (selectedClass) {
      onNextStep?.();
    } else {
      console.error("No class selected");
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Choose Your Challenge</h1>
        <p className="text-muted-foreground">
          Select the competition class that matches your endurance goals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {competitionClasses.map((competitionClass) => (
          <motion.div
            key={competitionClass.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-colors ${
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
                <CardDescription>
                  Starts at {competitionClass.startTime}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{competitionClass.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{competitionClass.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {competitionClass.participantCount} participants
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedClass}
          className="min-w-[200px]"
        >
          Continue
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}
