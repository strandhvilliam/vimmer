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
import { Marathon } from "@vimmer/supabase/types";

interface DomainListProps {
  marathons: Marathon[];
}

export function DomainList({ marathons }: DomainListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {marathons.map((marathon) => (
        <DomainCard key={marathon.id} marathon={marathon} />
      ))}
    </div>
  );
}

interface DomainCardProps {
  marathon: Marathon;
}

function DomainCard({ marathon }: DomainCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{marathon.name}</CardTitle>
        <CardDescription>{marathon.domain}</CardDescription>
      </CardHeader>

      <CardFooter className="mt-auto">
        <Link href={`/domains/${marathon.id}`} className="w-full">
          <Button className="w-full" variant="default">
            <span>Enter domain</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
