import { getCompetitionClassesByDomain } from "@vimmer/supabase/cached-queries";
import CompetitionClassList from "./competition-class-list";

export async function CompetitionClassSection({ domain }: { domain: string }) {
  const classes = await getCompetitionClassesByDomain(domain);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold font-rocgrotesk">
          Competition Classes
        </h2>
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
