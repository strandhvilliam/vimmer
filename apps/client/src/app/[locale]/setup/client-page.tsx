"use client";

import { demoaction } from "@/lib/actions/demo";
import { useChangeLocale } from "@/locales/client";
import { Marathon } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { ArrowRight, Globe } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

interface Props {
  marathon: Marathon;
}

export function LanguageSelectionPage({ marathon }: Props) {
  const changeLocale = useChangeLocale();

  return (
    <motion.div
      className="min-h-screen py-12 px-4 bg-slate-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Button onClick={async () => await demoaction()}>Demoaction</Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl font-bold text-center">
            {marathon.name}
          </CardTitle>
          <CardDescription className="text-center text-lg">
            {marathon.domain}
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

          {/* <Accordion type="single" collapsible className="w-full"> */}
          {/*   {competitionInfo.rules.map((rule, index) => ( */}
          {/*     <AccordionItem key={index} value={`item-${index}`}> */}
          {/*       <AccordionTrigger className="text-left"> */}
          {/*         {rule.title} */}
          {/*       </AccordionTrigger> */}
          {/*       <AccordionContent>{rule.content}</AccordionContent> */}
          {/*     </AccordionItem> */}
          {/*   ))} */}
          {/* </Accordion> */}
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
