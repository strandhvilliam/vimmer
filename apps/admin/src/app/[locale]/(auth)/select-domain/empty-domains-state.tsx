import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Link } from "lucide-react";
import { ContactDomainButton } from "./contact-button";

export function EmptyDomainsState() {
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
