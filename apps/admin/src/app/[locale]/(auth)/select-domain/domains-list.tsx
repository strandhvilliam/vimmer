// app/domains/components/domain-list.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Button } from "@vimmer/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Domain {
  id: string;
  name: string;
  description?: string;
}

interface DomainListProps {
  domains: Domain[];
}

export function DomainList({ domains }: DomainListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {domains.map((domain) => (
        <DomainCard key={domain.id} domain={domain} />
      ))}
    </div>
  );
}

interface DomainCardProps {
  domain: Domain;
}

function DomainCard({ domain }: DomainCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{domain.name}</CardTitle>
        {domain.description && (
          <CardDescription>{domain.description}</CardDescription>
        )}
      </CardHeader>

      <CardFooter className="mt-auto">
        <Link href={`/domains/${domain.id}`} className="w-full">
          <Button className="w-full" variant="default">
            <span>Enter domain</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
