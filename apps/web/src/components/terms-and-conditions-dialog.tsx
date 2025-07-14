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
                Please read these terms carefully before participating in
                Stockholm Fotomaraton
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 pb-24">
              <section>
                <h3 className="font-semibold text-xl mb-4">
                  1. Photo Submission Guidelines
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-base text-gray-600">
                  <li>
                    All photographs must be original works taken by you during
                    the specified competition period
                  </li>
                  <li>
                    Photos must be submitted in JPG or PNG format with a maximum
                    file size of 10MB per photo
                  </li>
                  <li>
                    Basic editing (exposure, contrast, color correction) is
                    allowed, but heavy manipulation or compositing is not
                    permitted
                  </li>
                  <li>
                    Photos must be taken in the order of the themes as they are
                    announced
                  </li>
                  <li>
                    Each photo must be submitted within the designated timeframe
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-xl mb-4">
                  2. Personal Data Processing
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-base text-gray-600">
                  <li>
                    We collect and process your name, email, and phone number
                    for competition administration and communication
                  </li>
                  <li>
                    Your contact information will be used only for
                    competition-related communications
                  </li>
                  <li>
                    Winners' names may be published on our website and social
                    media channels
                  </li>
                  <li>
                    Your personal data will be stored securely and retained only
                    for the duration necessary
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-xl mb-4">
                  3. Image Rights and Usage
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-base text-gray-600">
                  <li>You retain copyright of your submitted photographs</li>
                  <li>
                    By participating, you grant Stockholm Fotomaraton
                    non-exclusive rights to use your submitted photos for
                    promotional purposes
                  </li>
                  <li>
                    We will always credit photographers when using their images
                  </li>
                  <li>
                    You are responsible for obtaining any necessary permissions
                    from identifiable individuals in your photos
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-xl mb-4">
                  4. Competition Rules
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-base text-gray-600">
                  <li>
                    Participants must follow the competition schedule and theme
                    announcements
                  </li>
                  <li>Decisions made by the jury are final</li>
                  <li>Violation of any rules may result in disqualification</li>
                  <li>
                    The competition organizers reserve the right to modify rules
                    or cancel the event due to unforeseen circumstances
                  </li>
                </ul>
              </section>
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
