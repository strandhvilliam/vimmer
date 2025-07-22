"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import dynamic from "next/dynamic";
import { ConfirmationDetailsDialog } from "@/components/participate/confirmation-details-dialog";
import { ConfirmationData } from "@/lib/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { Icon } from "@iconify/react";
import { CheckCircle2, Trophy, ArrowRight } from "lucide-react";

interface ConfirmationClientProps {
  participantRef: string;
  thumbnailsBaseUrl: string;
  previewsBaseUrl: string;
}

const Confetti = dynamic(
  () => import("react-confetti").then((mod) => mod.default),
  {
    ssr: false,
  },
);

export function ConfirmationClient({
  participantRef,
  thumbnailsBaseUrl,
  previewsBaseUrl,
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

  const uploadedSubmissions = submissionsWithTopic.filter(
    (submission) => submission.status === "uploaded",
  );

  const images: ConfirmationData[] = uploadedSubmissions
    .sort((a, b) => (a.topic?.orderIndex ?? 0) - (b.topic?.orderIndex ?? 0))
    .map((submission) => ({
      id: submission.id.toString(),
      thumbnailUrl: submission.thumbnailKey
        ? `${thumbnailsBaseUrl}/${submission.thumbnailKey}`
        : undefined,
      previewUrl: submission.previewKey
        ? `${previewsBaseUrl}/${submission.previewKey}`
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
      <div className="min-h-[100dvh] px-4 py-6 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 pt-8"
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 relative"
            >
              <CheckCircle2 className="h-14 w-14 text-white" />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
              >
                <Trophy className="h-4 w-4 text-yellow-800" />
              </motion.div>
            </motion.div>
          </div>

          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-rocgrotesk font-bold text-foreground"
            >
              Congratulations!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg leading-relaxed"
            >
              Your {uploadedSubmissions.length} photos are uploaded and ready
              for judging! Good work!
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-2xl text-green-600 dark:text-green-400 font-mono font-bold">
                      #{participant.reference}
                    </p>
                    <p className=" font-medium text-green-800 dark:text-green-200">
                      {participant.firstname} {participant.lastname}
                    </p>
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="solar:bookmark-broken"
                        className="w-4 h-4 text-green-800"
                        style={{
                          transform: "rotate(-5deg)",
                        }}
                      />
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {participant.deviceGroup?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon
                        icon="solar:camera-minimalistic-broken"
                        className="w-4 h-4 text-green-800"
                        style={{
                          transform: "rotate(-5deg)",
                        }}
                      />
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {participant.competitionClass?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Photo Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <CardHeader className="pb-4 px-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              Your Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
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
              className="space-y-3"
            >
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 },
                  }}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.thumbnailUrl}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* <Badge className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs bg-primary"> */}
                    {/*   {index + 1} */}
                    {/* </Badge> */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-lg text-muted-foreground">
                      #{image.orderIndex + 1}
                    </span>
                    <p className="font-medium truncate">{image.name}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-primary" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Judging Phase</h3>
                    <p className="text-sm text-muted-foreground">
                      Our expert jury will review all submissions
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Results Announced</h3>
                    <p className="text-sm text-muted-foreground">
                      Winners will be contacted via email
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Share Your Work</h3>
                    <p className="text-sm text-muted-foreground">
                      You can share your photos after results
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <ConfirmationDetailsDialog
          image={selectedImage}
          open={!!selectedImage}
          onOpenChange={(open) => !open && setSelectedImage(null)}
        />
      </div>

      <Confetti recycle={false} numberOfPieces={150} />
    </>
  );
}
