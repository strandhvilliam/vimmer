import { Alert, AlertDescription } from "@vimmer/ui/components/alert";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Input } from "@vimmer/ui/components/input";
import { AlertCircle, ArrowRight } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";

interface ValidationError {
  hasError: boolean;
  message: string;
}

export default function ParticipantRegistration({
  onNextStep,
}: {
  onNextStep?: () => void;
  onPrevStep?: () => void;
}) {
  const [participantReference, setParticipantReference] = useQueryState(
    "pr",
    parseAsString.withDefault(""),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ValidationError>({
    hasError: false,
    message: "",
  });

  const validateParticipantNumber = (number: string | null): boolean => {
    if (!number) {
      setError({
        hasError: true,
        message: "Please enter a valid 6-digit participant number",
      });
      return false;
    }
    // Example validation - modify based on your actual participant number format
    const isValidFormat = /^\d{6}$/.test(number);
    if (!isValidFormat) {
      setError({
        hasError: true,
        message: "Please enter a valid 6-digit participant number",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({ hasError: false, message: "" });

    if (!validateParticipantNumber(participantReference)) {
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onNextStep?.();
    } catch (_: unknown) {
      setError({
        hasError: true,
        message: "Failed to verify participant number. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl font-bold text-center">
          Enter Your Participant Number
        </CardTitle>
        <CardDescription className="text-center">
          Please enter the 6-digit number from your registration confirmation
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error.hasError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter 6-digit number"
              value={participantReference}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setParticipantReference(value);
                if (error.hasError) {
                  setError({ hasError: false, message: "" });
                }
              }}
              className="text-center text-lg tracking-wider"
              maxLength={6}
            />
            <p className="text-sm text-muted-foreground text-center">
              Example: 123456
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || participantReference.length !== 6}
          >
            {isLoading ? "Verifying..." : "Continue"}
            {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
