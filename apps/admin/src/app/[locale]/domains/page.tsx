import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@vimmer/ui/components/card";
import { DomainSelect } from "./domain-select";
import { LanguageToggle } from "../(auth)/components/language-toggle";

export default function DomainSelectPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Select Domain</CardTitle>
          <CardDescription>Choose a domain to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading domains...</div>}>
            <DomainSelect />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
