import { Button } from "@vimmer/ui/components/button";
import { Card, CardContent } from "@vimmer/ui/components/card";

export default function ParticipantRegistration({
  onNextStep,
}: {
  onNextStep?: () => void;
  onPrevStep?: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-4">
          Participant Registration
        </h2>
        <div className="flex justify-end mt-4">
          <Button onClick={onNextStep}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
