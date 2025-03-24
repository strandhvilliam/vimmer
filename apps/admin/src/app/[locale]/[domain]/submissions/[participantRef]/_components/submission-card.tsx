"use client";

import { AlertTriangle } from "lucide-react";
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

interface PhotoSubmissionCardProps {
  submission: Submission & {
    validationErrors: ValidationError[];
    topic: Topic;
  };
}

const PLACEHOLDER_HASH = "LLI5Y-%M?bxuWBxu-;of~q%MWBt7";

export function PhotoSubmissionCard({ submission }: PhotoSubmissionCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.2, 0.65, 0.3, 0.9],
      }}
    >
      <Card
        className="overflow-hidden shadow-sm group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
        onClick={handleClick}
      >
        <CardContent className="p-0 overflow-hidden aspect-[4/3]">
          <div className="relative ">
            <div className="absolute top-2 left-2 z-10">
              <Badge
                variant="outline"
                className="bg-background/80 backdrop-blur-sm"
              >
                #{submission.topic.orderIndex + 1}
              </Badge>
            </div>

            <Blurhash
              hash={PLACEHOLDER_HASH}
              width={400}
              height={300}
              punch={1}
              resolutionX={32}
              resolutionY={32}
              className="w-full h-full object-cover absolute inset-0 bg-transparent"
            />

            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 0 : 1 }}
              transition={{ opacity: { delay: 0.5, duration: 0.3 } }}
              loading="lazy"
              className={cn(
                "w-full object-cover rounded-t-lg bg-black absolute inset-0"
              )}
              src={"https://picsum.photos/seed/1/400/300?grayscale"}
              alt={submission.topic.name}
            />
          </div>
        </CardContent>
        <CardFooter className="p-4 flex flex-col items-start gap-2 border ">
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
  );
}
