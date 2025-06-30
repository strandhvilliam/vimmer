import { Suspense } from "react";
import { DomainSelect } from "./_components/domain-select";
import { LanguageToggle } from "@/components/language-toggle";
import { getSession } from "@/lib/auth";
import { SelectDomainTitle } from "./_components/select-domain-title";
import { DomainSelectSkeleton } from "./_components/domain-select-skeleton";
import { redirect } from "next/navigation";
import { prefetch, trpc } from "@/trpc/server";

export default async function DomainSelectPage() {
  const session = await getSession();

  if (!session) {
    return redirect("/auth/admin/login");
  }

  prefetch(
    trpc.users.getMarathonsByUserId.queryOptions({
      userId: session.user.id,
    })
  );
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
          <DomainSelect session={session} />
        </Suspense>
      </div>
    </div>
  );
}
