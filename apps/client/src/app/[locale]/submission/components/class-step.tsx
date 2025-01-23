import { Button } from "@vimmer/ui/components/button";
import { Card, CardContent } from "@vimmer/ui/components/card";

export function CompetitionClassSelection({
  onNextStep,
  onPrevStep,
}: {
  onNextStep?: () => void;
  onPrevStep?: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Select Competition Class
        </h2>
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onPrevStep}>
            Back
          </Button>
          <Button onClick={onNextStep}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
