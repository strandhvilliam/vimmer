import { Suspense } from "react";
import { ClassSelectionClient } from "./class-selection-client";

interface CompetitionClass {
  id: string;
  name: string;
  duration: string;
  description: string;
  startTime: string;
  participantCount: number;
}

// This would be replaced with actual data fetching
async function getCompetitionClasses(): Promise<CompetitionClass[]> {
  return [
    {
      id: "8hr",
      name: "8 Hour Challenge",
      duration: "8 hours",
      description:
        "Perfect for experienced runners looking for a challenging day race",
      startTime: "06:00",
      participantCount: 250,
    },
    {
      id: "24hr",
      name: "24 Hour Ultra",
      duration: "24 hours",
      description: "The ultimate endurance test for elite ultra runners",
      startTime: "10:00",
      participantCount: 100,
    },
  ];
}

export default async function CompetitionClassPage() {
  const competitionClasses = await getCompetitionClasses();

  return (
    <div className="min-h-screen py-12 px-4 bg-slate-50">
      <Suspense fallback={<ClassSelectionSkeleton />}>
        <ClassSelectionClient competitionClasses={competitionClasses} />
      </Suspense>
    </div>
  );
}

// Skeleton loader component
function ClassSelectionSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mx-auto mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-64 rounded-lg border-2 border-slate-200 p-6 animate-pulse"
          >
            <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
