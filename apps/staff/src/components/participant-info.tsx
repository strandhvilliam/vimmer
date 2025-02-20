import { ParticipantData } from "@/lib/types";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";

interface ParticipantInfoProps {
  data: ParticipantData;
  onDismissWarning: (index: number) => void;
}

export default function ParticipantInfo({
  data,
  onDismissWarning,
}: ParticipantInfoProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Participant Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <strong>Participant Number:</strong> {data.participantNumber}
          </p>
          <p>
            <strong>Name:</strong> {data.firstName} {data.lastName}
          </p>
          <p>
            <strong>Email:</strong> {data.email}
          </p>
          <p>
            <strong>Submissions:</strong> {data.submissions}
          </p>
          {data.warnings.length > 0 && (
            <div>
              <strong>Warnings/Errors:</strong>
              <ul className="list-disc pl-5">
                {data.warnings.map((warning, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{warning}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDismissWarning(index)}
                    >
                      Dismiss
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
