"use client";

import { motion } from "framer-motion";
import { Button } from "@vimmer/ui/components/button";
import { useState, useEffect } from "react";
import { Calendar, Clock, Image, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import { Submission } from "@vimmer/supabase/types";

interface ImageData {
  id: string;
  url: string;
  previewUrl?: string;
  name: string;
  orderIndex: number;
  exif: Submission["exif"];
}

interface ConfirmationClientProps {
  images: ImageData[];
}

function ImageDetailsDialog({
  image,
  open,
  onOpenChange,
}: {
  image: ImageData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state whenever a new image is shown
  useEffect(() => {
    setIsLoading(true);
  }, [image?.id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            #{(image?.orderIndex ?? 0) + 1} {image?.name}
          </DialogTitle>
          <DialogDescription>Photo details</DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <div className="rounded-md overflow-hidden bg-black/5 aspect-square sm:aspect-auto min-h-[200px] flex items-center justify-center">
            {isLoading && image && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {image && (
              <img
                src={image.previewUrl || image.url}
                alt={image.name}
                className={`w-full h-auto max-h-[60vh] object-contain transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
                onLoad={() => setIsLoading(false)}
              />
            )}
          </div>
        </div>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 opacity-70" />
            <div className="text-sm text-muted-foreground">
              This is your submission for topic "{image?.name}"
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-70" />
            <div className="text-sm text-muted-foreground">
              Uploaded {new Date().toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 opacity-70" />
            <div className="text-sm text-muted-foreground">
              Will be evaluated after the event concludes
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmationClient({ images }: ConfirmationClientProps) {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-12 px-4">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
          Congratulations!
        </CardTitle>
        <CardDescription className="text-center">
          Your photos have been successfully uploaded. Please do not share your
          photos until the prize winner is announced.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {images.map((image) => (
            <motion.div
              key={image.id}
              variants={item}
              className="relative group"
            >
              <Card
                className="overflow-hidden border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 bg-background/90">
                  <p className="text-xs font-medium truncate">
                    #{image.orderIndex + 1} {image.name}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 items-center justify-center">
        <p className="text-sm text-muted-foreground font-medium">
          You may now close this window.
        </p>
      </CardFooter>

      <ImageDetailsDialog
        image={selectedImage}
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      />
    </div>
  );
}
