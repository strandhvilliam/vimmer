"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Search } from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Button } from "@vimmer/ui/components/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@vimmer/ui/components/alert";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Icon and Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-orange-100 p-6">
              <Search className="h-12 w-12 text-orange-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-rocgrotesk font-bold text-gray-900">
              Marathon Not Found
            </h1>
            <p className="text-lg text-gray-600">
              The photo marathon you're looking for doesn't exist or is no
              longer available
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <PrimaryButton
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2"
          >
            Find Available Marathons
          </PrimaryButton>
        </div>

        {/* Help text */}
        <div className="text-center text-sm text-gray-500">
          <p>
            If you believe this is an error, please contact the marathon
            organizers or check if you have the correct link.
          </p>
        </div>
      </div>
    </div>
  );
}
