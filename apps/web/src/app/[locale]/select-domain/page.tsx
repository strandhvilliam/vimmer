import { Suspense } from "react";
import { DomainSelect } from "@/components/domain-select";
import { getSession } from "@/lib/auth";
import { SelectDomainTitle } from "@/components/select-domain-title";
import { DomainSelectSkeleton } from "@/components/domain-select-skeleton";
import { redirect } from "next/navigation";
import { prefetch, trpc } from "@/trpc/server";
import { z } from "zod";

type PageProps = {
  searchParams: Promise<{
    type: string;
  }>;
};

const searchParamsSchema = z.object({
  type: z.enum(["admin", "staff"]).optional().default("admin"),
});

export default async function DomainSelectPage({ searchParams }: PageProps) {
  const { type } = searchParamsSchema.parse(await searchParams);
  const session = await getSession();

  if (!session) {
    return redirect(`/auth/${type}/login`);
  }

  prefetch(
    trpc.users.getMarathonsByUserId.queryOptions({
      userId: session.user.id,
    }),
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black relative overflow-hidden flex-col gap-4">
      <div className="absolute z-0 inset-0 pointer-events-none opacity-70 dark:opacity-0 bg-dot-pattern-light" />
      <div className="absolute z-0 inset-0 opacity-0 dark:opacity-70 pointer-events-none bg-dot-pattern-dark" />

      <SelectDomainTitle />
      <div className="w-full max-w-md relative z-10 mt-4 min-h-[500px]">
        <Suspense fallback={<DomainSelectSkeleton />}>
          <DomainSelect session={session} />
        </Suspense>
      </div>
    </div>
  );
}
