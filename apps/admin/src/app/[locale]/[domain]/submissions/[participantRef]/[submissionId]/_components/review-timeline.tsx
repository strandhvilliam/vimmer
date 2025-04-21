import { format } from "date-fns";
import {
  CheckCircle,
  Clock3,
  AlertTriangle,
  XCircle,
  ImageIcon,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Submission, Topic } from "@vimmer/supabase/types";

interface ReviewStep {
  status: "completed" | "current" | "upcoming";
  title: string;
  description: string;
  timestamp?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ReviewTimelineProps {
  submission: Submission & { topic: Topic };
  participant: any;
  hasIssues: boolean;
}

export function ReviewTimeline({
  submission,
  participant,
  hasIssues,
}: ReviewTimelineProps) {
  // Generate the review steps based on the submission data
  const reviewSteps: ReviewStep[] = [
    {
      status: "completed",
      title: "Participant Initialized",
      description: "Participant registered in the system",
      timestamp: format(new Date(participant.createdAt), "MMM d, yyyy HH:mm"),
      icon: Clock3,
    },
    {
      status: "completed",
      title: "Photo Uploaded",
      description: "Photo uploaded by participant",
      timestamp: format(new Date(submission.createdAt), "MMM d, yyyy HH:mm"),
      icon: ImageIcon,
    },
    {
      status: hasIssues ? "completed" : "current",
      title: "Submission Processed",
      description: hasIssues
        ? "Issues found during processing"
        : "Technical validation complete",
      timestamp: hasIssues
        ? format(new Date(submission.createdAt), "MMM d, yyyy HH:mm")
        : undefined,
      icon: AlertTriangle,
    },
    {
      status:
        submission.status === "approved"
          ? "completed"
          : submission.status === "rejected"
            ? "completed"
            : "upcoming",
      title: "Staff Verified",
      description:
        submission.status === "approved"
          ? "Photo verified for competition"
          : submission.status === "rejected"
            ? "Photo rejected"
            : "Awaiting staff verification",
      timestamp:
        submission.status !== "pending" && submission.updatedAt
          ? format(new Date(submission.updatedAt), "MMM d, yyyy HH:mm")
          : undefined,
      icon:
        submission.status === "approved"
          ? CheckCircle2
          : submission.status === "rejected"
            ? XCircle
            : Clock3,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Submission Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {reviewSteps.map((step, index) => (
            <div key={index} className="flex gap-4 pb-8 last:pb-0 relative">
              {index < reviewSteps.length - 1 && (
                <div
                  className={`absolute left-[15px] z-10 top-[30px] bottom-0 w-[2px] ${
                    step.status === "completed" &&
                    reviewSteps[index + 1]?.status === "completed"
                      ? "bg-primary"
                      : step.status === "completed" &&
                          reviewSteps[index + 1]?.status === "current"
                        ? "bg-gradient-to-b from-primary to-yellow-500"
                        : step.status === "current" &&
                            reviewSteps[index + 1]?.status === "upcoming"
                          ? "bg-gradient-to-b from-yellow-500 to-muted-foreground/30"
                          : "bg-muted-foreground/30"
                  }`}
                />
              )}
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center z-20 border-2 ${
                  step.status === "completed"
                    ? "bg-primary/10 border-primary text-primary"
                    : step.status === "current"
                      ? "bg-yellow-500/10 border-yellow-500 text-yellow-500 animate-pulse"
                      : "bg-muted/10 border-muted-foreground/40 text-muted-foreground"
                }`}
              >
                {step.status === "completed" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </div>
              <div
                className={`flex-1 space-y-1 ${
                  step.status === "upcoming" ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`font-medium ${
                      step.status === "completed"
                        ? "text-primary"
                        : step.status === "current"
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                    {step.status === "current" && (
                      <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-600 font-medium py-0.5 px-2 rounded-full">
                        In Progress
                      </span>
                    )}
                    {step.status === "upcoming" && (
                      <span className="ml-2 text-xs bg-muted/20 text-muted-foreground font-medium py-0.5 px-2 rounded-full">
                        Pending
                      </span>
                    )}
                  </p>
                  {step.timestamp && (
                    <span className="text-sm text-muted-foreground">
                      {step.timestamp}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
