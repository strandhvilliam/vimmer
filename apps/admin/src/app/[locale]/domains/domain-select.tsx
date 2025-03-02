"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { selectDomain } from "./actions";

interface Domain {
  id: string;
  name: string;
}

// This would typically come from your API
const mockDomains: Domain[] = [
  { id: "1", name: "Example Domain 1" },
  { id: "2", name: "Example Domain 2" },
];

export function DomainSelect() {
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleDomainSelect(domain: string) {
    setSelectedDomain(domain);
    setIsLoading(true);

    try {
      await selectDomain({ domain });
      // No need to handle success case as the action will redirect
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select domain. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Select value={selectedDomain} onValueChange={handleDomainSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a domain" />
        </SelectTrigger>
        <SelectContent>
          {mockDomains.map((domain) => (
            <SelectItem key={domain.id} value={domain.id}>
              {domain.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
}
