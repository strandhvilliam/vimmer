"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Download } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card";

interface ConfirmationClientProps {
  images: Array<{
    id: string;
    url: string;
    previewUrl?: string;
    name: string;
    topicId?: number;
  }>;
}

export function ConfirmationClient({ images }: ConfirmationClientProps) {
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="min-h-screen py-12 px-4 bg-slate-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="flex justify-center mb-6"
          >
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>

          <CardTitle className="text-3xl font-bold mb-2">
            Upload Successful!
          </CardTitle>
          <CardDescription className="text-lg">
            Your photos have been successfully uploaded and are ready for the
            event
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
                className="relative group aspect-square rounded-lg overflow-hidden"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-white border-white hover:bg-white/20"
                    onClick={() =>
                      window.open(image.previewUrl || image.url, "_blank")
                    }
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Your photos will be automatically synchronized with your race
              number during the event. You can view and download them anytime
              from your participant dashboard.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Go to Dashboard
          </Button>
          <Button onClick={() => (window.location.href = "/race-info")}>
            View Race Information
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
