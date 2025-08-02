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

export default function PlatformTermsDialog({
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
                Vimmer Platform Terms of Service
              </DialogTitle>
              <DialogDescription className="text-lg">
                Terms and conditions for using the Vimmer platform
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-8 pb-24">
              <section>
                <h3 className="font-semibold text-xl mb-4">
                  1. Platform Usage
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-base text-gray-600">
                  <li>
                    By using the Vimmer platform, you agree to these terms of
                    service
                  </li>
                  <li>
                    The platform is provided "as is" without warranties of any
                    kind
                  </li>
                  <li>
                    You are responsible for maintaining the security of your
                    account
                  </li>
                  <li>
                    Vimmer reserves the right to modify or discontinue the
                    service at any time
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-xl mb-4">
                  2. Data Processing and Privacy
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-base text-gray-600">
                  <li>
                    Vimmer processes your data in accordance with our Privacy
                    Policy
                  </li>
                  <li>
                    Your photos and personal information are stored securely on
                    our servers
                  </li>
                  <li>
                    We do not share your personal data with third parties
                    without consent
                  </li>
                  <li>
                    You can request deletion of your data at any time by
                    contacting support
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-xl mb-4">
                  3. Intellectual Property
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-base text-gray-600">
                  <li>You retain all rights to your uploaded photographs</li>
                  <li>Vimmer does not claim ownership of your content</li>
                  <li>
                    The Vimmer platform and its features are protected by
                    copyright
                  </li>
                  <li>
                    You may not reverse engineer or copy the platform's
                    functionality
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-xl mb-4">
                  4. Limitation of Liability
                </h3>
                <ul className="list-disc pl-5 space-y-3 text-base text-gray-600">
                  <li>
                    Vimmer is not liable for any damages arising from platform
                    usage
                  </li>
                  <li>
                    We are not responsible for competition rules or judging
                    decisions
                  </li>
                  <li>
                    Technical issues or downtime may occur and are not
                    guaranteed to be resolved
                  </li>
                  <li>
                    Maximum liability is limited to the amount paid for platform
                    services
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-xl mb-4">
                  5. Contact Information
                </h3>
                <div className="text-base text-gray-600">
                  <p className="mb-2">
                    For questions about these terms or the platform, contact us
                    at:
                  </p>
                  <p>Email: support@blikka.app</p>
                  <p>Website: https://blikka.app</p>
                </div>
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
              Accept Platform Terms
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
