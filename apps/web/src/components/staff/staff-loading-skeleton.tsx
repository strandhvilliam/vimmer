"use client";

import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import { BouncingDots } from "@/components/bouncing-dots";

export function StaffLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh]">
      <DotPattern />
      <div className="flex flex-col items-center gap-6">
        <img src="/vimmer-black.svg" alt="Vimmer Logo" className="w-16 h-16" />
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-bold font-rocgrotesk text-foreground">
            Loading Staff Portal
          </h2>
          <BouncingDots />
        </div>
      </div>
    </div>
  );
}
