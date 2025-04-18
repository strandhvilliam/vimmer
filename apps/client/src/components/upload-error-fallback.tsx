import { AlertOctagon } from "lucide-react";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Button } from "@vimmer/ui/components/button";
import React from "react";

export default function UploadErrorFallback({
  error,
  onPrevStep,
}: {
  error: string;
  onPrevStep?: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto min-h-[80vh] flex flex-col justify-center py-12 px-4">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-destructive">
            Unable to Prepare Submission
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AlertOctagon className="h-24 w-24 text-destructive" />
          </motion.div>
          <p className="text-lg text-center text-muted-foreground max-w-md">
            {error || "An unexpected error occurred"}
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Please contact a crew member for assistance
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={onPrevStep}
            className="w-[200px]"
          >
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
