"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@vimmer/ui/components/input";
import { Button } from "@vimmer/ui/components/button";
import { Search, UserSearch } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { useQuery } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";

export function ParticipantQuickSearch() {
  const [searchValue, setSearchValue] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);
  const router = useRouter();
  const trpc = useTRPC();
  const { domain } = useDomain();

  // Only trigger search when we have a value and shouldSearch is true
  const { data: participant, error } = useQuery({
    ...trpc.participants.getByReference.queryOptions({
      domain,
      reference: searchValue.trim(),
    }),
    enabled: shouldSearch && searchValue.trim().length > 0,
  });

  const handleSearch = () => {
    if (!searchValue.trim()) return;

    setShouldSearch(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Navigate when participant is found
  useEffect(() => {
    if (participant && shouldSearch) {
      setShouldSearch(false);
      router.push(`/admin/submissions/${participant.reference}`);
      setSearchValue("");
    }
  }, [participant, shouldSearch, router]);

  // Handle error state
  useEffect(() => {
    if (error && shouldSearch) {
      setShouldSearch(false);
      // Could add a toast notification here if available
      console.warn("Participant not found:", searchValue);
    }
  }, [error, shouldSearch, searchValue]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 bg-sidebar-accent rounded-md border">
            <div className="relative">
              <Input
                placeholder="Participant ref..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-36 h-8 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <UserSearch className="h-3.5 w-3.5 absolute right-2 top-2 text-muted-foreground" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearch}
              disabled={!searchValue.trim()}
              className="h-8 px-2"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Quick search for participant by reference</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
