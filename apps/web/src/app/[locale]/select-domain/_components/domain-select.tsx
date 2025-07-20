"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { Card, CardTitle, CardDescription } from "@vimmer/ui/components/card";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { useAction } from "next-safe-action/hooks";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { selectDomain } from "@/lib/actions/select-domain";
import { Session, User } from "better-auth";
import { useSearchParams } from "next/navigation";
import { z } from "zod";

const ITEMS_PER_PAGE = 10;

const searchParamsSchema = z.object({
  type: z.enum(["admin", "staff"]).optional().default("admin"),
});

export function DomainSelect({
  session,
}: {
  session: { user: User; session: Session };
}) {
  const trpc = useTRPC();
  const searchParams = useSearchParams();
  const { data: marathons } = useSuspenseQuery(
    trpc.users.getMarathonsByUserId.queryOptions(
      {
        userId: session.user.id,
      },
      {
        enabled: !!session.user.id,
      }
    )
  );
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMarathons = marathons.slice(startIndex, endIndex);
  const totalPages = Math.ceil(marathons.length / ITEMS_PER_PAGE);
  const [isSelecting, setIsSelecting] = useState(false);

  const { execute, isExecuting } = useAction(selectDomain);

  const handleDomainSelect = useCallback(
    async (domain: string) => {
      setIsSelecting(true);
      setSelectedDomainId(domain);

      try {
        const { type } = searchParamsSchema.parse(
          Object.fromEntries(searchParams)
        );
        execute({ domain, type });
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to select domain. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSelecting(false);
      }
    },
    [execute, searchParams]
  );

  useEffect(() => {
    if (isSelecting) return;
    if (marathons.length === 1 && marathons[0]) {
      handleDomainSelect(marathons[0].domain);
    }
  }, [marathons, handleDomainSelect, isSelecting]);

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
