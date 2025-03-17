import { Separator } from "@vimmer/ui/components/separator";
import { Card } from "@vimmer/ui/components/card";
import { Button } from "@vimmer/ui/components/button";
import { Plus, Camera, Smartphone, XIcon } from "lucide-react";
import { Suspense } from "react";
import { ClassesLoadingSkeleton } from "./classes-loading-skeleton";
import { CompetitionClassesSection } from "./classes-competition-section";
import { DeviceGroupsSection } from "./classes-device-section";

export default function ClassesPage() {
  return (
    <div className="container mx-auto p-6 space-y-10 max-w-[1300px]">
      <Suspense fallback={<ClassesLoadingSkeleton />}>
        <CompetitionClassesSection />
      </Suspense>
      <Separator className="my-8" />
      <Suspense fallback={<ClassesLoadingSkeleton />}>
        <DeviceGroupsSection />
      </Suspense>
    </div>
  );
}
