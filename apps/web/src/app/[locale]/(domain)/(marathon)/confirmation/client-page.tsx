"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card";
import dynamic from "next/dynamic";
import { ConfirmationDetailsDialog } from "@/components/confirmation-details-dialog";
import { ConfirmationData } from "@/lib/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { Resource } from "sst";

interface ConfirmationClientProps {
  participantRef: string;
}

const Confetti = dynamic(
  () => import("react-confetti").then((mod) => mod.default),
  {
    ssr: false,
  },
);

export function ConfirmationClient({
  participantRef,
}: ConfirmationClientProps) {
  const { domain } = useDomain();
  const trpc = useTRPC();
  const [selectedImage, setSelectedImage] = useState<ConfirmationData | null>(
    null,
  );

  const { data: participant } = useSuspenseQuery(
    trpc.participants.getByReference.queryOptions({
      reference: participantRef,
      domain,
    }),
  );

  const { data: topics } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  );

  const submissionsWithTopic =
    participant?.submissions.map((submission) => ({
      ...submission,
      topic: topics.find((topic) => topic.id === submission.topicId),
    })) ?? [];

  const images: ConfirmationData[] = submissionsWithTopic
    .filter((submission) => submission.status === "uploaded")
    .sort((a, b) => (a.topic?.orderIndex ?? 0) - (b.topic?.orderIndex ?? 0))
    .map((submission) => ({
      id: submission.id.toString(),
      thumbnailUrl: submission.thumbnailKey
        ? `${Resource.ThumbnailsRouter.url}/${submission.thumbnailKey}`
        : undefined,
      previewUrl: submission.previewKey
        ? `${Resource.PreviewsRouter.url}/${submission.previewKey}`
        : undefined,
      name: submission.topic?.name || `Photo ${submission.id}`,
      orderIndex: submission.topic?.orderIndex ?? 0,
      exif: submission.exif as Record<string, unknown>,
    }));

  if (!participant) {
    return null;
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 py-12 px-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
            Congratulations!
          </CardTitle>
          <CardDescription className="text-center">
            Your photos have been successfully uploaded. Please do not share
            your photos until the prize winner is announced.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1"
          >
            {images.map((image) => (
              <motion.div
                key={image.id}
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1 },
                }}
                className="relative group"
              >
                <Card
                  className="shadow-none overflow-hidden border rounded-lg cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.thumbnailUrl}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card>
                <div className="text-xs text-foreground gap-4 mt-1">
                  {`#${image.orderIndex + 1} ${image.name}`}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 items-center justify-center">
          <p className="text-sm text-muted-foreground font-medium">
            You may now close this window.
          </p>
        </CardFooter>

        <ConfirmationDetailsDialog
          image={selectedImage}
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        />
      </div>

      <Confetti recycle={false} />
    </>
  );
}
