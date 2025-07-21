"use client";

import { AlertTriangle, Mail, ChevronRight, ImageIcon } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { Marathon } from "@vimmer/api/db/types";
import Link from "next/link";

interface RequiredAction {
  action: string;
  description: string;
}

interface MarathonNotConfiguredProps {
  marathon: Marathon | null;
  requiredActions: RequiredAction[];
}

export function MarathonNotConfigured({
  marathon,
  requiredActions,
}: MarathonNotConfiguredProps) {
  return (
    <div className="flex flex-col min-h-[100dvh] relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
      <div className="z-20 flex flex-col flex-1 h-full">
        <header className="flex justify-between items-center p-4">
          <div className="font-rocgrotesk font-extrabold">vimmer</div>
          <div>
            <Button variant="link" className="text-xs h-8 px-2 gap-0" asChild>
              <Link href="/staff">
                Staff
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-6 pb-6 max-w-md mx-auto w-full flex flex-col justify-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4">
              {marathon?.logoUrl ? (
                <img src={marathon.logoUrl} alt="Logo" width={96} height={96} />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-200">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </div>
            <h1 className="text-3xl font-rocgrotesk font-extrabold text-gray-900 text-center">
              {marathon?.name || "Photo Marathon"}
            </h1>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border border-red-200/50 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-rocgrotesk font-semibold text-gray-900">
                  Setup in Progress
                </h2>
                <p className="text-sm text-gray-600">
                  Marathon configuration incomplete
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4 leading-relaxed">
                This marathon is currently being set up by the organizers. The
                following items need to be configured before submissions can
                begin:
              </p>

              <div className="space-y-3">
                {requiredActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700 font-medium">
                      {action.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Need help?
                  </p>
                  <p className="text-sm text-gray-600">
                    Contact the organizer for more information about when
                    submissions will open.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full py-3 text-base rounded-full border-2"
              onClick={() => {
                window.location.reload();
              }}
            >
              Check Again
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
