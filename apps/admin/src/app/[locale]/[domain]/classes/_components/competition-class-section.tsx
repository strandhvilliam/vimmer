import { Button } from "@vimmer/ui/components/button";
import { Card } from "@vimmer/ui/components/card";
import { XIcon } from "lucide-react";
import { getCompetitionClassesByDomain } from "@vimmer/supabase/cached-queries";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip";
import CompetitionClassList from "./competition-class-list";
import { CompetitionClassCreateDialog } from "./competition-class-create-dialog";

export async function CompetitionClassSection({ domain }: { domain: string }) {
  const classes = await getCompetitionClassesByDomain(domain);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Competition Classes</h2>
      </div>
      <p className="text-sm text-muted-foreground pb-4">
        Here you can manage the classes that are available for the marathon.
        This will decide how many photos the participants need to take for each
        class.
      </p>
      <CompetitionClassList classes={classes} />
    </section>
  );
}
