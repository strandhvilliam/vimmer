import { Button } from "@vimmer/ui/components/button";
import { Card, CardContent } from "@vimmer/ui/components/card";

export function SubmitSubmissions({
  onPrevStep,
}: {
  onPrevStep?: () => void;
  onNextStep?: () => void;
}) {
  const handleSubmit = async () => {
    console.log("Submitting...");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Review & Submit</h2>
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onPrevStep}>
            Back
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
}
