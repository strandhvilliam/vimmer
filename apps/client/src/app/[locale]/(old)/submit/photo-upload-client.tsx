"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Upload,
  X,
  Image as ImageIcon,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { useToast } from "@vimmer/ui/hooks/use-toast";
import { Button } from "@vimmer/ui/components/button";
import { Progress } from "@vimmer/ui/components/progress";

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

interface UploadProgressProps {
  files: Array<{ id: string; name: string }>;
  onComplete: () => void;
  onError: (error: Error) => void;
}

type FileStatus = "pending" | "uploading" | "completed" | "error";

interface FileState {
  id: string;
  name: string;
  status: FileStatus;
}

export function UploadProgress({
  files,
  onComplete,
  onError,
}: UploadProgressProps) {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  useEffect(() => {
    // Initialize file states
    setFileStates(
      files.map((file) => ({
        id: file.id,
        name: file.name,
        status: "pending",
      })),
    );
  }, [files]);

  useEffect(() => {
    const uploadFiles = async () => {
      try {
        // Simulate uploading files one by one
        for (const file of fileStates) {
          // Mark current file as uploading
          setFileStates((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: "uploading" } : f,
            ),
          );

          // Simulate upload with random duration
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 + Math.random() * 2000),
          );

          // Mark file as completed
          setFileStates((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, status: "completed" } : f,
            ),
          );
          setCompletedCount((prev) => prev + 1);
        }

        // All files completed
        setIsAllCompleted(true);
        onComplete();
      } catch (error) {
        onError(error as Error);
      }
    };

    if (fileStates.length > 0) {
      uploadFiles();
    }
  }, [fileStates.length]); // Only run once when component mounts

  const progressPercentage = (completedCount / files.length) * 100;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Uploading Photos</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>
                {completedCount} of {files.length} completed
              </span>
            </div>
            <Progress value={progressPercentage} />
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {fileStates.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span className="truncate flex-1 mr-3">{file.name}</span>
                  <div className="flex-shrink-0">
                    {file.status === "pending" && <div className="w-5 h-5" />}
                    {file.status === "uploading" && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                    {file.status === "completed" && (
                      <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </motion.div>
                    )}
                    {file.status === "error" && (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          {isAllCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button size="lg" onClick={onComplete} className="min-w-[200px]">
                Continue
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
