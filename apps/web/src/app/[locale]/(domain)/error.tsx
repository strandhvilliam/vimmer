"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Home } from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Button } from "@vimmer/ui/components/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Error boundary caught an error:", error);
  }, [error]);

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-rocgrotesk font-bold text-gray-900">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600">
            We encountered an unexpected error. Please try again or return to
            the home page.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
            <h3 className="font-medium text-red-800 mb-2">Error Details:</h3>
            <code className="text-sm text-red-700 break-all">
              {error.message}
            </code>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            Try Again
          </Button>

          <PrimaryButton
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
