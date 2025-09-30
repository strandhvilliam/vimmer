import { trpc, batchPrefetch, HydrateClient } from "@/trpc/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ReviewClientPage } from "./client-page";
import { Resource } from "sst";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    notFound();
  }

  batchPrefetch([
    trpc.jury.verifyTokenAndGetInitialData.queryOptions({
      token,
    }),
  ]);

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <ReviewClientPage
          token={token}
          previewBaseUrl={"https://d1kohskzoo8ek1.cloudfront.net"}
          thumbnailBaseUrl={Resource.ThumbnailsRouter.url}
          submissionBaseUrl={"https://d1kohskzoo8ek1.cloudfront.net"}
        />
      </Suspense>
    </HydrateClient>
  );
}
