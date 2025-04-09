"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { Badge } from "@vimmer/ui/components/badge";
import { Card, CardContent, CardFooter } from "@vimmer/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import { Blurhash } from "react-blurhash";
import { useState } from "react";
import { Submission, ValidationError, Topic } from "@vimmer/supabase/types";
import { cn } from "@vimmer/ui/lib/utils";
import { useParams } from "next/navigation";

interface PhotoSubmissionCardProps {
  submission: Submission & {
    validationErrors: ValidationError[];
    topic: Topic;
  };
}

const PLACEHOLDER_HASH = "LLI5Y-%M?bxuWBxu-;of~q%MWBt7";

const THUMBNAIL_BASE_URL = "https://d2xu2hgpxoda9b.cloudfront.net";

const PREVIEW_BASE_URL = "https://d2w93ix7jvihnu.cloudfront.net";
function getThumbnailImageUrl(submission: Submission) {
  return `${THUMBNAIL_BASE_URL}/${submission.thumbnailKey}`;
}

export function PhotoSubmissionCard({ submission }: PhotoSubmissionCardProps) {
  const { domain, participantRef } = useParams();

  return (
    <Link href={`/${domain}/submissions/${participantRef}/${submission.id}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          ease: [0.2, 0.65, 0.3, 0.9],
        }}
      >
        <Card className="group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all overflow-hidden">
          <CardContent className="relative p-0 flex items-center justify-center aspect-[4/3] bg-black/40 overflow-hidden">
            <div className="absolute top-2 left-2 z-10">
              <Badge
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                #{submission.topic.orderIndex + 1}
              </Badge>
            </div>

            {/* <Blurhash
            hash={PLACEHOLDER_HASH}
            width={300}
            height={200}
            punch={1}
            resolutionX={32}
            resolutionY={32}
            className="w-full object-cover !absolute inset-0 bg-transparent "
          /> */}

            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ opacity: { delay: 0.5, duration: 0.3 } }}
              loading="lazy"
              className={cn("w-full h-full object-contain rounded-t-lg")}
              src={getThumbnailImageUrl(submission)}
              alt={submission.topic.name}
            />
          </CardContent>
          <CardFooter className="p-4 flex flex-col items-start gap-2 ">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-medium">{submission.topic.name}</h3>
              {submission.validationErrors.length > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-1">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            submission.validationErrors.length > 0
                              ? "text-destructive"
                              : "text-yellow-500"
                          }`}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-2">
                        {submission.validationErrors.length > 0 ? (
                          <div>
                            <p className="font-semibold text-destructive">
                              Errors:
                            </p>
                            <ul className="list-disc pl-4 space-y-1">
                              {submission.validationErrors.map((error, i) => (
                                <li key={i} className="text-sm">
                                  {error.message}
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
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}
