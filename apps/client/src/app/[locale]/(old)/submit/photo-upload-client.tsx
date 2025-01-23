"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { useToast } from "@vimmer/ui/hooks/use-toast";
import { Button } from "@vimmer/ui/components/button";
import { UploadProgress } from "./upload-progress";

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

const MAX_PHOTOS = 8;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export function PhotoUploadClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
  };
  const filesToUpload = photos.map((photo) => ({
    id: photo.id,
    name: photo.file.name,
  }));

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG and WebP images are allowed";
    }
    if (file.size > MAX_SIZE) {
      return "Image must be less than 5MB";
    }
    return null;
  };

  const handleFiles = useCallback(
    (files: FileList) => {
      const remainingSlots = MAX_PHOTOS - photos.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      filesToProcess.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          toast({
            title: "Invalid file",
            description: error,
            variant: "destructive",
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotos((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(7),
              file,
              preview: e.target?.result as string,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    },
    [photos.length, toast],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter((photo) => photo.id !== id));
  };

  const handleSubmit = async () => {
    // Here you would typically upload the photos to your server
    try {
      await handleUpload();
      // Simulate upload
      // await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {isUploading && (
        <UploadProgress
          files={filesToUpload}
          onComplete={() => {
            setIsUploading(false);
            router.push("/confirmation");
          }}
          onError={(error) => {
            setIsUploading(false);
            toast({
              title: "Upload failed",
              description: error.message,
              variant: "destructive",
            });
          }}
        />
      )}
      <motion.div
        className="min-h-screen py-12 px-4 bg-slate-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Upload Your Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`
              border-2 border-dashed rounded-lg p-8 mb-6 transition-colors
              ${isDragging ? "border-primary bg-primary/5" : "border-muted"}
              ${photos.length >= MAX_PHOTOS ? "opacity-50 pointer-events-none" : ""}
            `}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Drag and drop your photos here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  {photos.length} of {MAX_PHOTOS} photos uploaded
                </p>
                <input
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="photo-input"
                  disabled={photos.length >= MAX_PHOTOS}
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    document.getElementById("photo-input")?.click()
                  }
                  disabled={photos.length >= MAX_PHOTOS}
                  className="mt-4"
                >
                  Select Photos
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {/* <AnimatePresence> */}
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square"
                >
                  <img
                    src={photo.preview}
                    alt="Upload preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/75 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </motion.div>
              ))}
              {[...Array(MAX_PHOTOS - photos.length)].map((_, index) => (
                <motion.div
                  key={`empty-${index}`}
                  className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center"
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                </motion.div>
              ))}
              {/* </AnimatePresence> */}
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={photos.length === 0}
              className="min-w-[200px]"
            >
              Upload Photos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  );
}
