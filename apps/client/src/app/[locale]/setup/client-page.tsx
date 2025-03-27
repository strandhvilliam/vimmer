"use client";

import { useState } from "react";
import { ChevronRight, Info, Camera, X, Moon, Sun } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { Checkbox } from "@vimmer/ui/components/checkbox";
import ReactCountryFlag from "react-country-flag";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@vimmer/ui/components/accordion";
import { useRouter } from "next/navigation";
import { Marathon } from "@vimmer/supabase/types";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import TermsAndConditionsDialog from "../../../components/terms-and-conditions-dialog";
import { useTheme } from "next-themes";

const LOGO =
  "https://www.stockholmfotomaraton.se/wp-content/uploads/2022/11/Logga-22-png-1024x1024-1.png";

export function SetupClientPage({ marathon }: { marathon: Marathon }) {
  const router = useRouter();
  const [language, setLanguage] = useState<string>("en");
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [termsOpen, setTermsOpen] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();

  const handleBeginUpload = () => {
    if (termsAccepted) {
      router.push("/submission");
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] relative overflow-hidden">
      <div className="relative z-20 flex flex-col flex-1 h-full">
        <div className="absolute top-4 right-4 z-30">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <header className="flex flex-col items-center pt-16 pb-4 px-4">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3">
            <img src={LOGO} alt="Logo" width={96} height={96} />
          </div>
          <h1 className="text-3xl font-rocgrotesk font-extrabold text-gray-900 text-center mt-2">
            Stockholm Fotomaraton
          </h1>
          <p className=" text-center text-lg mt-1 font-medium tracking-wide">
            16 August 2025
          </p>
        </header>

        <main className="flex-1 px-6 pb-6 max-w-md mx-auto w-full flex flex-col justify-end">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border border-background/20 shadow-xl">
            <h2 className="text-2xl font-rocgrotesk font-semibold  mb-4">
              Getting Started
            </h2>

            <section className="mb-5">
              <label className="block text-sm font-medium mb-2">
                Choose Language
              </label>
              <div className="flex flex-col gap-3">
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  className="flex-1 flex items-center justify-center gap-2 py-4"
                  onClick={() => setLanguage("en")}
                >
                  <ReactCountryFlag countryCode="GB" svg />
                  English
                </Button>
                <Button
                  variant={language === "sv" ? "default" : "outline"}
                  className="flex-1 flex items-center justify-center gap-2 py-4"
                  onClick={() => setLanguage("sv")}
                >
                  <ReactCountryFlag countryCode="SE" svg />
                  Svenska
                </Button>
              </div>
            </section>

            <section className="mb-5">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="rules" className="border-gray-200">
                  <AccordionTrigger
                    className="font-semibold text-sm py-3"
                    onClick={() => {
                      setTimeout(() => {
                        window.scrollTo({
                          top: document.documentElement.scrollHeight,
                          behavior: "smooth",
                        });
                      }, 150);
                    }}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <Info size={16} className="" />
                      Competition Rules & Info
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm font-medium space-y-2">
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
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) =>
                    setTermsAccepted(checked as boolean)
                  }
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm font-medium">
                  I accept the{" "}
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="underline font-semibold"
                  >
                    terms and conditions
                  </button>
                </label>
              </div>
            </section>

            <TermsAndConditionsDialog
              termsOpen={termsOpen}
              setTermsOpen={setTermsOpen}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
            />

            <PrimaryButton
              onClick={handleBeginUpload}
              disabled={!termsAccepted}
              className="w-full py-3 text-base  text-white rounded-full"
            >
              Begin
              <ChevronRight className="ml-2 h-5 w-5" />
            </PrimaryButton>
          </div>
        </main>
      </div>
    </div>
  );
}
