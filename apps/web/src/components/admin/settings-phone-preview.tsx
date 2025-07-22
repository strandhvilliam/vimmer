"use client";

import React from "react";
import { format } from "date-fns";
import { ChevronRight, Info } from "lucide-react";
import { Marathon } from "@vimmer/api/db/types";
import { Button } from "@vimmer/ui/components/button";
import { Checkbox } from "@vimmer/ui/components/checkbox";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@vimmer/ui/components/accordion";

export function SettingsPhonePreview({ marathon }: { marathon: Marathon }) {
  return (
    <div className="w-[340px] max-h-[680px] relative border-8 border-muted rounded-3xl overflow-y-auto shadow-2xl flex flex-col">
      <DotPattern />

      <div className="flex-1 bg-backgroun relative">
        <header className="flex flex-col items-center pt-16 pb-4 px-4">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-3 flex items-center justify-center">
            {marathon.logoUrl ? (
              <img
                src={marathon.logoUrl}
                alt="Marathon logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  width="40"
                  height="40"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-center font-rocgrotesk">
            {marathon.name || "Stockholm Fotomaraton"}
          </h1>
          <p className="text-center text-lg mt-1 font-medium tracking-wide">
            {marathon.startDate
              ? format(marathon.startDate, "d MMMM yyyy")
              : "16 August 2025"}
          </p>
        </header>

        <main className="flex-1 w-11/12 mx-auto pb-6 flex flex-col justify-end">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border border-background/20 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 font-rocgrotesk">
              Getting Started
            </h2>

            <section className="mb-5">
              <label className="block text-xs font-medium mb-2">
                Choose Language
              </label>
              <div className="flex flex-col gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-foreground text-xs"
                >
                  <span>🇬🇧</span>
                  English
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 py-3 border-2 text-xs"
                >
                  <span>🇸🇪</span>
                  Svenska
                </Button>
              </div>
            </section>

            <section className="mb-5">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="rules" className="border-gray-200">
                  <AccordionTrigger className="font-semibold text-xs py-3">
                    <div className="flex items-center gap-2 font-medium">
                      <Info size={16} />
                      Competition Rules & Info
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs font-medium space-y-2">
                    <p>
                      Welcome to our annual photo competition! Here are the key
                      rules:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>All photos must be original and taken by you</li>
                      <li>Photos must be submitted in JPG or PNG format</li>
                      <li>Maximum file size: 10MB per photo</li>
                      <li>Submission deadline: August 15, 2025</li>
                      <li>Winners will be announced on September 1, 2025</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>

            <section className="mb-6">
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" className="mt-1" />
                <label htmlFor="terms" className="text-xs font-medium">
                  I accept the{" "}
                  <span className="underline font-semibold">
                    terms and conditions
                  </span>
                </label>
              </div>
            </section>

            <PrimaryButton className="w-full py-2 text-xs text-white rounded-full">
              Begin
              <ChevronRight className="ml-2 h-5 w-5" />
            </PrimaryButton>
          </div>
        </main>
      </div>
    </div>
  );
}
