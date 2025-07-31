import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { batchPrefetch, HydrateClient, trpc } from "@/trpc/server";
import { JuryClientPage } from "./client-page";
import { Resource } from "sst";
import { JuryLoadingSkeleton } from "@/components/jury/jury-loading-skeleton";

interface JuryPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function Jury({ searchParams }: JuryPageProps) {
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  batchPrefetch([
    trpc.jury.verifyTokenAndGetData.queryOptions({
      token,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<JuryLoadingSkeleton />}>
        <JuryClientPage
          previewBaseUrl={Resource.PreviewsRouter.url}
          token={token}
        />
      </Suspense>
    </HydrateClient>
  );
}
