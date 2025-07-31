import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import { Button } from "@vimmer/ui/components/button";
import { X } from "lucide-react";
import React from "react";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { useQuery } from "@tanstack/react-query";

export default function TermsAndConditionsDialog({
  termsOpen,
  setTermsOpen,
  termsAccepted,
  setTermsAccepted,
}: {
  termsOpen: boolean;
  setTermsOpen: (open: boolean) => void;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
}) {
  const trpc = useTRPC();
  const { domain } = useDomain();

  const { data: termsData, isLoading } = useQuery(
    trpc.terms.getByDomain.queryOptions({
      domain,
    }),
  );

  console.log({ termsData });

  return (
    <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
      <DialogContent className="max-w-none w-full h-[100dvh] p-0 rounded-none flex flex-col overflow-hidden">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setTermsOpen(false)}
            className="h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-3xl">
                Terms and Conditions
              </DialogTitle>
              <DialogDescription className="text-lg">
                Please read these terms carefully before participating
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 pb-24">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">
                    Loading terms and conditions...
                  </div>
                </div>
              ) : termsData?.content ? (
                <div className="whitespace-pre-wrap text-base text-gray-700 leading-relaxed">
                  {termsData.content}
                </div>
              ) : (
                <div className="space-y-8">Nothing here</div>
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 p-4 bg-white border-t">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => {
                setTermsAccepted(true);
                setTermsOpen(false);
              }}
              className="w-full py-6 text-lg font-medium"
            >
              Accept Terms
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
