"use client";

import { use, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@vimmer/ui/components/card";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { Marathon } from "@vimmer/supabase/types";
import { useAction } from "next-safe-action/hooks";
import { selectDomain } from "@/lib/actions/select-domain";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/hooks/use-session";

interface DomainSelectProps {
  marathonsPromise: Promise<Marathon[]>;
}

const ITEMS_PER_PAGE = 10;

export function DomainSelect() {
  const trpc = useTRPC();
  const { user } = useSession();
  const { data: marathons } = useSuspenseQuery(
    trpc.users.getMarathonsByUserId.queryOptions({
      userId: user?.id,
    })
  );
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMarathons = marathons.slice(startIndex, endIndex);
  const totalPages = Math.ceil(marathons.length / ITEMS_PER_PAGE);

  const { execute, isExecuting } = useAction(selectDomain);

  async function handleDomainSelect(domain: string) {
    setSelectedDomainId(domain);

    try {
      execute({ domain });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select domain. Please try again.",
        variant: "destructive",
      });
    }
  }

  if (marathons.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No domains available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-col gap-3 w-full">
        {currentMarathons.map((marathon) => (
          <Card
            key={marathon.id}
            className="flex flex-row items-center p-4 w-full"
          >
            <div className="flex flex-col w-full">
              <CardTitle className="text-lg">{marathon.name}</CardTitle>
              <CardDescription>Stockholm | {marathon.domain}</CardDescription>
            </div>
            <Button
              className="ml-auto"
              onClick={() => handleDomainSelect(marathon.domain)}
              disabled={isExecuting}
            >
              {isExecuting && selectedDomainId === marathon.id.toString() ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Selecting...
                </>
              ) : (
                "Select Marathon"
              )}
            </Button>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
