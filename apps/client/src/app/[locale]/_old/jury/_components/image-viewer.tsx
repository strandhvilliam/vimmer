"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, Info } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { Card, CardContent } from "@vimmer/ui/components/card";
import { Badge } from "@vimmer/ui/components/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@vimmer/ui/components/carousel";

interface ImageViewerProps {
  submissions: any[];
}

export default function ImageViewer({ submissions }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [api, setApi] = useState<any>(null);

  const currentSubmission = submissions[currentIndex];

  // Update current index when carousel changes
  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setIsLoading(true);
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        api?.scrollPrev();
      } else if (e.key === "ArrowRight") {
        api?.scrollNext();
      } else if (e.key === "i" || e.key === "I") {
        toggleDetails();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [api]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-neutral-950 overflow-hidden">
      {/* Carousel */}
      <Carousel
        className="w-full h-full"
        setApi={setApi}
        opts={{
          align: "center",
        }}
      >
        <CarouselContent className="h-full">
          {submissions.map((submission, index) => (
            <CarouselItem key={submission.id} className="h-full">
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={submission.imageUrl}
                  alt={submission.title}
                  //   fill
                  className={`object-contain transition-opacity duration-300`}
                  //   priority
                  //   onLoad={() => {
                  //     if (index === currentIndex) setIsLoading(false);
                  //   }}
                />

                {/* {isLoading && index === currentIndex && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  </div>
                )} */}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 hover:scale-110" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-200 hover:scale-110" />
      </Carousel>

      {/* Image Counter */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {submissions.length}
      </div>

      {/* Details Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        {showDetails ? (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-xl font-bold">
                    {currentSubmission.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By {currentSubmission.artist}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDetails}
                  className="flex items-center gap-1 text-xs"
                >
                  <span>Collapse</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 my-2">
                {currentSubmission.categories.map(
                  (category: any, index: any) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  )
                )}
              </div>

              <p className="text-sm mt-2">{currentSubmission.description}</p>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <p>Submitted: {currentSubmission.submissionDate}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="secondary"
            size="icon"
            className="h-10 w-10 flex items-center justify-center rounded-full shadow-lg mx-auto bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
            onClick={toggleDetails}
          >
            <Info className="h-5 w-5" />
            <span className="sr-only">Show details</span>
          </Button>
        )}
      </div>
    </div>
  );
}
