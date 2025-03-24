"use client";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@vimmer/ui/components/badge";
import { Card, CardContent, CardFooter } from "@vimmer/ui/components/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import { BlurhashCanvas } from "react-blurhash";
import { useState } from "react";
import { Submission, ValidationError, Topic } from "@vimmer/supabase/types";

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
    <Card
      className="overflow-hidden shadow-sm group cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          <div className="absolute top-2 left-2 z-10">
            <Badge
              variant="outline"
              className="bg-background/80 backdrop-blur-sm"
            >
              #{submission.topic.orderIndex}
            </Badge>
          </div>

          {!imageLoaded && !imageError && (
            <BlurhashCanvas
              hash={PLACEHOLDER_HASH}
              width={400}
              height={300}
              punch={1}
              className="w-full h-full object-cover"
            />
          )}

          <img
            src={"https://picsum.photos/seed/1/600/800?grayscale"}
            alt={submission.topic.name}
            className={`object-cover aspect-[4/3] group-hover:scale-[1.01] transition-transform duration-200 ${!imageLoaded ? "opacity-0" : "opacity-100"}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-col items-start gap-2">
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
  );
}
