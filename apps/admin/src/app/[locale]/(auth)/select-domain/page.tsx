// app/domains/page.tsx
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@vimmer/ui/components/card";
import Link from "next/link";
import { DomainList } from "./domains-list";
import { ContactDomainButton } from "./contact-button";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getUserWithMarathons } from "@vimmer/supabase/queries";
import { createClient } from "@vimmer/supabase/server";
import { Marathon } from "@vimmer/supabase/types";

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

export default async function DomainsPage() {
  // Fetch domains for the authenticated user
  const marathons = await getUserDomains();

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="mb-6 text-3xl font-bold">Your Domains</h1>

      {marathons.length > 0 ? (
        <DomainList marathons={marathons} />
      ) : (
        <EmptyDomainsState />
      )}
    </div>
  );
}

function EmptyDomainsState() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>No domains connected</CardTitle>
        <CardDescription>
          You don't have any domains connected to your account yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          To get started, you need to either join an existing domain by
          contacting its organizer, or create your own domain.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
        <ContactDomainButton />
        <Link href="/domains/contact-us">
          <Button variant="default">Create your own domain</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
