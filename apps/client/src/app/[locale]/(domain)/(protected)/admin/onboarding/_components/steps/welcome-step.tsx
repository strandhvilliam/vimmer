"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { CheckCircle, Users, Shield, Trophy, Settings } from "lucide-react";
import { useOnboarding } from "../onboarding-context";

interface WelcomeStepProps {
  onNext: () => void;
  onPrev: () => void;
  canGoBack: boolean;
  isLastStep: boolean;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { marathon } = useOnboarding();
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-muted shadow-lg backdrop-blur-sm rounded-2xl ">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-rocgrotesk ">
            Welcome to the onboarding process
          </CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Let&apos;s get your marathon set up and ready for participants.
          </CardDescription>
        </CardHeader>
        <div className="flex justify-center pb-4">
          <span className="text-sm text-muted-foreground font-medium">
            Domain Code: {marathon.domain}
          </span>
        </div>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="space-y-4 bg-neutral-100 p-6 rounded-lg">
              <h3 className="text-xl font-medium font-rocgrotesk">
                What we'll set up:
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-vimmer-primary" />
                  <span className="">Marathon configuration & branding</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-vimmer-primary" />
                  <span className="">Photo validation rules</span>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-vimmer-primary" />
                  <span className="">Competition classes</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-vimmer-primary" />
                  <span className="">Device groups & categories</span>
                </div>
              </div>
            </div>
          </div>

          <div className="">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <h4 className="font-semibold mb-2">
                  This setup will take about 10 minutes
                </h4>
                <p className="text-muted-foreground text-sm">
                  You can go back and modify any step until you confirm the
                  final summary. Once complete, your marathon will be ready to
                  accept participants when the start date is reached.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <PrimaryButton
              className="p-4 rounded-full w-full max-w-md text-xl"
              onClick={onNext}
            >
              Get Started
            </PrimaryButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
