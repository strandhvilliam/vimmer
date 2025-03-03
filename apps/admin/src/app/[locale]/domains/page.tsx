import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@vimmer/ui/components/card";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import { DomainSelect } from "../../../components/domain-select";
import { LanguageToggle } from "../(auth)/components/language-toggle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createClient } from "@vimmer/supabase/server";
import { getUserWithMarathons } from "@vimmer/supabase/queries";
import { Marathon } from "@vimmer/supabase/types";
import { SelectDomainTitle } from "@/components/select-domain-title";
import { DomainSelectSkeleton } from "@/components/domain-select-skeleton";

export async function getUserDomains(): Promise<Marathon[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return [];
  }
  const supabase = await createClient();
  const user = await getUserWithMarathons(supabase, session.user.id);
  return (
    user?.userMarathons.map((userMarathon) => userMarathon.marathons) ?? []
  );
}

export default async function DomainSelectPage() {
  const marathonsPromise = getUserDomains();
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black relative overflow-hidden flex-col gap-4">
      <div className="absolute z-0 inset-0 pointer-events-none opacity-70 dark:opacity-0 bg-dot-pattern-light" />
      <div className="absolute z-0 inset-0 opacity-0 dark:opacity-70 pointer-events-none bg-dot-pattern-dark" />

      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      <SelectDomainTitle />
      <div className="w-full max-w-md relative z-10 mt-4 min-h-[500px]">
        <Suspense fallback={<DomainSelectSkeleton />}>
          <DomainSelect marathonsPromise={marathonsPromise} />
        </Suspense>
      </div>
    </div>
  );
}
