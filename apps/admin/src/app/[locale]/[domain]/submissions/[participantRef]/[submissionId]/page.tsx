import { notFound } from "next/navigation";
import { Button } from "@vimmer/ui/components/button";
import {
  ArrowLeft,
  Camera,
  Smartphone,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Clock3,
  MessageCircle,
  Image as ImageIcon,
  Trash2,
  Upload,
  FileSpreadsheet,
  MapPin,
  Building2,
  Star,
  InfoIcon,
  ListFilter,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@vimmer/ui/components/badge";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@vimmer/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import { Separator } from "@vimmer/ui/components/separator";
import { Textarea } from "@vimmer/ui/components/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vimmer/ui/components/table";
import { getParticipantByReference } from "@vimmer/supabase/cached-queries";
import { Submission, Topic, ValidationError } from "@vimmer/supabase/types";

interface PageProps {
  params: Promise<{
    participantId: string;
    submissionId: string;
  }>;
}

interface PhotoSubmission {
  id: number;
  topicName: string;
  imageUrl: string;
  uploadedAt: string;
  capturedAt: string;
  status: "pending" | "approved" | "rejected";
  warnings?: string[];
  errors?: string[];
  order: number;
  processingSteps: {
    location: string;
    timestamp: string;
    description: string;
  }[];
  totalProcessingTime?: string;
  expectedCompletionTime?: string;
  validationSteps?: {
    name: string;
    status: "valid" | "warning" | "error" | "ai_warning";
    message: string;
  }[];
}

interface ParticipantData {
  id: number;
  participantNumber: string;
  name: string;
  uploadStatus: "complete" | "incomplete" | "not_started";
  competitionClass: string;
  device: "smartphone" | "camera";
  warnings: string[];
  errors: string[];
  submissions: PhotoSubmission[];
}

type MockDataType = {
  [key: number]: ParticipantData;
};

const defaultProcessingSteps = [
  {
    location: "Upload Station 1, Main Venue",
    timestamp: "2024-03-15T10:00:00Z",
    description: "Photo received from participant",
  },
  {
    location: "Processing Server, Technical Review",
    timestamp: "2024-03-15T10:15:00Z",
    description: "Technical validation in progress",
  },
];

const MOCK_DATA: MockDataType = {
  1: {
    id: 1,
    participantNumber: "P001",
    name: "Alice Smith",
    uploadStatus: "complete" as const,
    competitionClass: "Marathon",
    device: "smartphone" as const,
    warnings: ["Image size too small"],
    errors: [],
    submissions: [
      {
        id: 1,
        order: 1,
        topicName: "Urban Life",
        imageUrl: `https://picsum.photos/seed/1/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:00:00Z",
        capturedAt: "2024-03-15T09:30:00Z",
        status: "approved",
        processingSteps: defaultProcessingSteps,
      },
      {
        id: 2,
        order: 2,
        topicName: "Nature",
        imageUrl: `https://picsum.photos/seed/6/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:15:00Z",
        capturedAt: "2024-03-15T09:45:00Z",
        status: "pending",
        warnings: ["Image size too small"],
        processingSteps: defaultProcessingSteps,
      },
      {
        id: 3,
        order: 3,
        topicName: "People",
        imageUrl: `https://picsum.photos/seed/5/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:30:00Z",
        capturedAt: "2024-03-15T10:00:00Z",
        status: "approved",
        processingSteps: defaultProcessingSteps,
      },
      {
        id: 4,
        order: 4,
        topicName: "Architecture",
        imageUrl: `https://picsum.photos/seed/4/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:45:00Z",
        capturedAt: "2024-03-15T10:15:00Z",
        status: "pending",
        processingSteps: defaultProcessingSteps,
      },
      {
        id: 7,
        order: 5,
        topicName: "Motion",
        imageUrl: `https://picsum.photos/seed/7/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:00:00Z",
        capturedAt: "2024-03-15T10:30:00Z",
        status: "approved",
        processingSteps: defaultProcessingSteps,
      },
      {
        id: 8,
        order: 6,
        topicName: "Colors",
        imageUrl: `https://picsum.photos/seed/8/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:15:00Z",
        capturedAt: "2024-03-15T10:45:00Z",
        status: "approved",
        processingSteps: defaultProcessingSteps,
      },
      {
        id: 9,
        order: 7,
        topicName: "Shadows",
        imageUrl: `https://picsum.photos/seed/9/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:30:00Z",
        capturedAt: "2024-03-15T11:00:00Z",
        status: "pending",
        processingSteps: defaultProcessingSteps,
      },
      {
        id: 10,
        order: 8,
        topicName: "Reflection",
        imageUrl: `https://picsum.photos/seed/10/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:45:00Z",
        capturedAt: "2024-03-15T11:15:00Z",
        status: "approved",
        processingSteps: defaultProcessingSteps,
      },
    ],
  },
  2: {
    id: 2,
    participantNumber: "P002",
    name: "Bob Johnson",
    uploadStatus: "incomplete" as const,
    competitionClass: "Sprint",
    device: "camera" as const,
    warnings: [],
    errors: ["Missing EXIF data"],
    submissions: [
      {
        id: 5,
        order: 1,
        topicName: "Street",
        imageUrl: `https://picsum.photos/seed/2/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:00:00Z",
        capturedAt: "2024-03-15T10:30:00Z",
        status: "rejected",
        errors: ["Missing EXIF data"],
        processingSteps: defaultProcessingSteps,
      },
      {
        id: 6,
        order: 2,
        topicName: "Food",
        imageUrl: `https://picsum.photos/seed/3/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:15:00Z",
        capturedAt: "2024-03-15T10:45:00Z",
        status: "approved",
        processingSteps: defaultProcessingSteps,
      },
    ],
  },
};

interface ReviewStep {
  status: "completed" | "current" | "upcoming";
  title: string;
  description: string;
  timestamp?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{
    domain: string;
    participantRef: string;
    submissionId: string;
  }>;
}) {
  const { domain, participantRef, submissionId } = await params;
  const participant = await getParticipantByReference(domain, participantRef);

  if (!participant) {
    notFound();
  }

  const submission = participant.submissions.find(
    (s) => s.id === parseInt(submissionId)
  );

  if (!submission) {
    notFound();
  }

  const statusVariants = {
    pending: "secondary",
    approved: "default",
    rejected: "destructive",
  } as const;

  const statusLabels = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
  } as const;

  const hasIssues = submission.validationErrors.length > 0;

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
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${domain}/submissions/${participantRef}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold font-rocgrotesk">
                SUB-{submission.id.toString().padStart(4, "0")}
              </h1>
              <Badge
                variant={
                  statusVariants[
                    submission.status as keyof typeof statusVariants
                  ]
                }
              >
                {statusLabels[submission.status as keyof typeof statusLabels]}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Submission date{" "}
              {format(new Date(submission.createdAt), "MMM d, yyyy")} • Photo #
              {submission.topic.orderIndex + 1}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4" />
            Notify Participant
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4" />
            Cancel Submission
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        <div>
          <Tabs defaultValue="details" className="">
            <TabsList className="bg-background rounded-none p-0 h-auto border-b border-muted-foreground/25 w-full flex justify-start">
              <TabsTrigger
                value="details"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                Details & Timeline
              </TabsTrigger>
              <TabsTrigger
                value="validation"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                Validation Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6 mt-4">
              <Card className="border-none p-0 shadow-none">
                <CardContent className="space-y-6 p-1">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Uploaded At
                      </h3>
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <p>
                          {format(
                            new Date(submission.createdAt),
                            "MMM d, yyyy HH:mm"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Topic
                      </h3>
                      <p>{submission.topic.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Device Type
                      </h3>
                      <div className="flex items-center gap-2">
                        {participant.deviceGroup?.icon === "smartphone" ? (
                          <>
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <p>Smartphone</p>
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <p>Camera</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Competition Class
                      </h3>
                      <p>
                        {participant.competitionClass?.name || "Not assigned"}
                      </p>
                    </div>
                  </div>

                  {hasIssues && (
                    <div className="mt-6 p-4 bg-destructive/10 rounded-lg">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <p className="font-medium">Processing Issues</p>
                      </div>
                      <p className="text-sm mt-1">
                        There are validation issues that need to be addressed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    Submission Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {reviewSteps.map((step, index) => (
                      <div
                        key={index}
                        className="flex gap-4 pb-8 last:pb-0 relative"
                      >
                        {index < reviewSteps.length - 1 && (
                          <div className="absolute left-[15px] z-10 top-[30px] bottom-0 w-[2px] bg-border" />
                        )}
                        <div
                          className={`rounded-full h-fit p-1 z-20 bg-background border ${
                            step.status === "completed"
                              ? "border-primary text-primary"
                              : step.status === "current"
                                ? "border-yellow-500 text-yellow-500"
                                : "border-muted-foreground text-muted-foreground"
                          }`}
                        >
                          <step.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{step.title}</p>
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
            </TabsContent>

            <TabsContent value="validation" className="mt-4">
              <ValidationStepsTable
                validationSteps={submission.validationErrors}
              />
            </TabsContent>
          </Tabs>
        </div>
        <PhotoSubmissionCard submission={submission} />
      </div>
    </div>
  );
}

const PREVIEW_BASE_URL = "https://d2w93ix7jvihnu.cloudfront.net";
function getThumbnailImageUrl(submission: Submission) {
  return `${PREVIEW_BASE_URL}/${submission.previewKey}`;
}

function PhotoSubmissionCard({
  submission,
}: {
  submission: Submission & { topic: Topic };
}) {
  return (
    <div className="space-y-4">
      <Card className="sticky top-8 overflow-hidden shadow-2xl">
        <CardContent className="p-0 bg-black/50">
          <div className="relative w-full overflow-hidden">
            <img
              src={getThumbnailImageUrl(submission)}
              alt={submission.topic.name}
              className="object-contain w-full h-full max-h-[70vh]"
            />
          </div>
        </CardContent>

        <div className="bg-black p-4 flex flex-col justify-end ">
          <div className="text-white">
            <h3 className="text-xl font-bold">{submission.topic.name}</h3>
            <p className="text-sm opacity-90">
              Photo #{submission.topic.orderIndex + 1}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ValidationStepsTable({
  validationSteps,
}: {
  validationSteps: ValidationError[];
}) {
  const getStatusContent = (severity: string) => {
    switch (severity) {
      case "info":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Star className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validationSteps.map((step, index) => (
            <TableRow key={index}>
              <TableCell>{getStatusContent(step.severity)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {step.message || "No message provided"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
