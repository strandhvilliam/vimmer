"use client";

import { useChangeLocale, useI18n } from "@/locales/client";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@vimmer/ui/components/accordion";
import { ArrowRight, Globe } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

interface CompetitionInfo {
  title: string;
  welcomeMessage: string;
  rules: Array<{ title: string; content: string }>;
}

const competitionInfo: CompetitionInfo = {
  title: "Marathon Championship 2025",
  welcomeMessage:
    "Welcome to the most exciting marathon event of the year! Choose your preferred language to continue.",
  rules: [
    {
      title: "Registration Requirements",
      content:
        "Participants must be 18+ and provide valid identification. Medical clearance is required.",
    },
    {
      title: "Race Day Rules",
      content:
        "Arrive 2 hours before start time. Wearing your official bib number is mandatory. No headphones allowed.",
    },
    {
      title: "Course Guidelines",
      content:
        "Stay on marked course. Water stations every 5km. Medical support available throughout the route.",
    },
  ],
};

export function LanguageSelectionPage() {
  const t = useI18n();
  const changeLocale = useChangeLocale();

  return (
    <motion.div
      className="min-h-screen py-12 px-4 bg-slate-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl font-bold text-center">
            {competitionInfo.title}
          </CardTitle>
          <CardDescription className="text-center text-lg">
            {competitionInfo.welcomeMessage}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => changeLocale("en")}
              className="h-16 text-lg"
            >
              <Globe className="mr-2 h-5 w-5" />
              English
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => changeLocale("sv")}
              className="h-16 text-lg"
            >
              <Globe className="mr-2 h-5 w-5" />
              Swedish
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {competitionInfo.rules.map((rule, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {rule.title}
                </AccordionTrigger>
                <AccordionContent>{rule.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>

        <CardFooter className="flex justify-center pt-6">
          <Link href="/submission">
            <Button size="lg" className="w-full md:w-auto">
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
