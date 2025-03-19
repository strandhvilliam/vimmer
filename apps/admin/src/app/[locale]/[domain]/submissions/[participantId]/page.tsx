"use client";
import { notFound } from "next/navigation";
import { Button } from "@vimmer/ui/components/button";
import { ArrowLeft, Camera, Smartphone, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@vimmer/ui/components/badge";
import { Card, CardContent, CardFooter } from "@vimmer/ui/components/card";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";

interface PageProps {
  params: Promise<{
    participantId: string;
  }>;
}

interface PhotoSubmission {
  id: number;
  topicName: string;
  imageUrl: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  warnings?: string[];
  errors?: string[];
  order: number;
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

const MOCK_DATA: Record<number, ParticipantData> = {
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
        status: "approved",
      },
      {
        id: 2,
        order: 2,
        topicName: "Nature",
        imageUrl: `https://picsum.photos/seed/6/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:15:00Z",
        status: "pending",
        warnings: ["Image size too small"],
      },
      {
        id: 3,
        order: 3,
        topicName: "People",
        imageUrl: `https://picsum.photos/seed/5/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:30:00Z",
        status: "approved",
      },
      {
        id: 4,
        order: 4,
        topicName: "Architecture",
        imageUrl: `https://picsum.photos/seed/4/600/800?grayscale`,
        uploadedAt: "2024-03-15T10:45:00Z",
        status: "pending",
      },
      {
        id: 7,
        order: 5,
        topicName: "Motion",
        imageUrl: `https://picsum.photos/seed/7/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:00:00Z",
        status: "approved",
      },
      {
        id: 8,
        order: 6,
        topicName: "Colors",
        imageUrl: `https://picsum.photos/seed/8/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:15:00Z",
        status: "approved",
      },
      {
        id: 9,
        order: 7,
        topicName: "Shadows",
        imageUrl: `https://picsum.photos/seed/9/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:30:00Z",
        status: "pending",
      },
      {
        id: 10,
        order: 8,
        topicName: "Reflection",
        imageUrl: `https://picsum.photos/seed/10/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:45:00Z",
        status: "approved",
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
        status: "rejected",
        errors: ["Missing EXIF data"],
      },
      {
        id: 6,
        order: 2,
        topicName: "Food",
        imageUrl: `https://picsum.photos/seed/3/600/800?grayscale`,
        uploadedAt: "2024-03-15T11:15:00Z",
        status: "approved",
      },
    ],
  },
};

function PhotoSubmissionCard({
  submission,
  participantId,
}: {
  submission: PhotoSubmission;
  participantId: number;
}) {
  const statusVariants = {
    pending: "secondary",
    approved: "default",
    rejected: "destructive",
  } as const;

  const statusLabels = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
  };

  const hasIssues =
    (submission.warnings?.length ?? 0) > 0 ||
    (submission.errors?.length ?? 0) > 0;

  return (
    <Card
      className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
      onClick={() =>
        (window.location.href = `/dev0/submissions/${participantId}/${submission.id}`)
      }
    >
      <CardContent className="p-0">
        <div className="relative">
          <div className="absolute top-2 left-2 z-10">
            <Badge
              variant="outline"
              className="bg-background/80 backdrop-blur-sm"
            >
              #{submission.order}
            </Badge>
          </div>
          <img
            src={submission.imageUrl}
            alt={submission.topicName}
            className="object-cover aspect-[4/3] group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start gap-2">
        <div className="flex items-center justify-between w-full">
          <h3 className="font-medium">{submission.topicName}</h3>
          {hasIssues && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex items-center gap-1">
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        submission.errors?.length
                          ? "text-destructive"
                          : "text-yellow-500"
                      }`}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-2">
                    {submission.errors?.length ? (
                      <div>
                        <p className="font-semibold text-destructive">
                          Errors:
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                          {submission.errors.map((error, i) => (
                            <li key={i} className="text-sm">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {submission.warnings?.length ? (
                      <div>
                        <p className="font-semibold text-yellow-500">
                          Warnings:
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                          {submission.warnings.map((warning, i) => (
                            <li key={i} className="text-sm">
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Badge variant={statusVariants[submission.status]}>
          {statusLabels[submission.status]}
        </Badge>
      </CardFooter>
    </Card>
  );
}

export default async function ParticipantSubmissionPage({ params }: PageProps) {
  const { participantId } = await params;
  const participant =
    participantId in MOCK_DATA ? MOCK_DATA[parseInt(participantId)] : null;

  if (!participant) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/submissions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {participant.name}
            </h1>
            {participant.device === "smartphone" ? (
              <Smartphone className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Camera className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Participant #{participant.participantNumber}</span>
            <span>•</span>
            <span>{participant.competitionClass}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {participant.submissions.map((submission) => (
          <PhotoSubmissionCard
            key={submission.id}
            submission={submission}
            participantId={participant.id}
          />
        ))}
        {participant.submissions.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No photos submitted yet
          </div>
        )}
      </div>
    </div>
  );
}
