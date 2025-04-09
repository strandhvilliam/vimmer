import React, { Suspense } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs";
import { Tables } from "@vimmer/supabase/types";
import SubmissionsParticipantsTab from "./_components/submissions-participants-tab";
import SubmissionsParticipantsTabSkeleton from "./_components/submissions-participants-skeleton";
import SubmissionsTopicsTab from "./_components/submissions-topics-tab";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

export default async function SubmissionsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight font-rocgrotesk">
          Submissions
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage photo submissions from participants
        </p>
      </div>

      <Tabs defaultValue="participants">
        <TabsList className="bg-background rounded-none p-0 h-auto border-b border-muted-foreground/25 w-full flex justify-start">
          <TabsTrigger
            value="participants"
            className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
          >
            By Participant
          </TabsTrigger>
          <TabsTrigger
            value="topics"
            className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
          >
            By Topic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-6">
          <Suspense fallback={<SubmissionsParticipantsTabSkeleton />}>
            <SubmissionsParticipantsTab />
          </Suspense>
        </TabsContent>

        <TabsContent value="topics" className="mt-6">
          <Suspense fallback={<div>Loading...</div>}>
            <SubmissionsTopicsTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
