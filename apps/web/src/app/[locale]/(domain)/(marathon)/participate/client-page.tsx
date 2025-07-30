"use client";

import { useState } from "react";
import { ChevronRight, Image, ImageIcon, Info } from "lucide-react";
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
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { cn } from "@vimmer/ui/lib/utils";
import Link from "next/link";
import { format } from "date-fns";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useDomain } from "@/contexts/domain-context";
import { useMarathonIsConfigured } from "@/hooks/use-marathon-is-configured";
import { MarathonNotConfigured } from "@/components/participate/marathon-not-configured";
import TermsAndConditionsDialog from "@/components/terms-and-conditions-dialog";
import { useChangeLocale, useCurrentLocale, useI18n } from "@/locales/client";
import ReactMarkdown from "react-markdown";

export function ParticipateClientPage() {
  const router = useRouter();
  const trpc = useTRPC();
  const { domain } = useDomain();
  const t = useI18n();
  const changeLocale = useChangeLocale();
  const locale = useCurrentLocale();

  const { data: marathon } = useQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
  );

  const { isConfigured, requiredActions } = useMarathonIsConfigured();

  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [termsOpen, setTermsOpen] = useState<boolean>(false);

  const handleBeginUpload = () => {
    if (termsAccepted) {
      router.push("/submission");
    }
  };

  if (!marathon) {
    return null;
  }

  if (!isConfigured) {
    return (
      <MarathonNotConfigured
        marathon={marathon}
        requiredActions={requiredActions}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] relative overflow-hidden">
      <div className=" z-20 flex flex-col flex-1 h-full">
        <header className="flex justify-between items-center p-4">
          <div className="font-rocgrotesk font-extrabold">vimmer</div>
          <div>
            <Button variant="link" className="text-xs h-8 px-2 gap-0" asChild>
              <Link href="/staff">
                {t("staff")}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 px-6 pb-6 max-w-md mx-auto w-full flex flex-col justify-end">
          <div className="flex flex-col items-center pb-12">
            {marathon.logoUrl ? (
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3 overflow-hidden shadow border">
                <img src={marathon.logoUrl} alt="Logo" width={96} height={96} />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-200">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
            <h1 className="text-3xl font-rocgrotesk font-extrabold text-gray-900 text-center mt-2">
              {marathon.name}
            </h1>
            <p className=" text-center text-lg mt-1 font-medium tracking-wide">
              {marathon.startDate && marathon.endDate ? (
                <>
                  {format(marathon.startDate, "dd MMMM yyyy")} -{" "}
                  {format(marathon.endDate, "dd MMMM yyyy")}
                </>
              ) : (
                t("participate.datesToBeAnnounced")
              )}
            </p>
          </div>
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 border border-background/20 shadow-xl">
            <h2 className="text-2xl font-rocgrotesk font-semibold  mb-4">
              {t("participate.gettingStarted")}
            </h2>

            <section className="mb-5">
              <label className="block text-sm font-medium mb-2">
                {t("participate.chooseLanguage")}
              </label>
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 border-2",
                    locale === "en" && "border-foreground",
                  )}
                  onClick={() => changeLocale("en")}
                >
                  <ReactCountryFlag countryCode="GB" svg />
                  English
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-4 border-2",
                    locale === "sv" && "border-foreground",
                  )}
                  onClick={() => changeLocale("sv")}
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
                      {t("participate.competitionRules")}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm font-medium space-y-2">
                    {marathon.description ? (
                      <div className="markdown-content">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="text-sm font-medium mb-2">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-5 space-y-1 mb-2">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-5 space-y-1 mb-2">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm font-medium">
                                {children}
                              </li>
                            ),
                            h1: ({ children }) => (
                              <h1 className="text-lg font-rocgrotesk font-bold mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-rocgrotesk font-semibold mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-rocgrotesk font-semibold mb-1">
                                {children}
                              </h3>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold">{children}</strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                className="underline text-blue-600 hover:text-blue-800"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {marathon.description}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="text-muted-foreground italic">
                        No description available. Please contact the organizer
                        for more information.
                      </div>
                    )}
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
                  {t("participate.termsAccept")}{" "}
                  <button
                    onClick={() => setTermsOpen(true)}
                    className="underline font-semibold"
                  >
                    {t("participate.termsAndConditions")}
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
              {t("begin")}
              <ChevronRight className="ml-2 h-5 w-5" />
            </PrimaryButton>
          </div>
        </main>
      </div>
    </div>
  );
}
