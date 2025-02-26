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

interface Domain {
  id: string;
  name: string;
  description?: string;
}

interface Domain {
  id: string;
  name: string;
  description?: string;
}

/**
 * Fetches the domains connected to the authenticated user
 * Replace this with your actual API implementation
 */
export async function getDomains(): Promise<Domain[]> {
  // This is a placeholder for your actual API call
  // In a real implementation, you would:
  // 1. Get the authenticated user (e.g., from a session)
  // 2. Call your backend API to fetch their domains

  try {
    // Example of how you might implement this with fetch:
    // const response = await fetch('/api/domains', {
    //   headers: {
    //     'Authorization': `Bearer ${session.token}`,
    //   },
    // });
    // if (!response.ok) throw new Error('Failed to fetch domains');
    // return response.json();

    // For demonstration purposes, we'll return an empty array
    // Replace this with your actual implementation
    return [];

    // Sample data for testing:
    // return [
    //   {
    //     id: "domain-1",
    //     name: "Organization Alpha",
    //     description: "Main organization for product development teams"
    //   },
    //   {
    //     id: "domain-2",
    //     name: "Marketing Department",
    //     description: "Domain for marketing team members"
    //   }
    // ];
  } catch (error) {
    console.error("Failed to fetch domains:", error);
    return [];
  }
}

export default async function DomainsPage() {
  // Fetch domains for the authenticated user
  const domains = await getDomains();
  const hasDomains = domains.length > 0;

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="mb-6 text-3xl font-bold">Your Domains</h1>

      {hasDomains ? <DomainList domains={domains} /> : <EmptyDomainsState />}
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
