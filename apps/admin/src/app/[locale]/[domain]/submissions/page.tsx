import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs";
import { ParticipantSubmissionsTable } from "./components/participant-submissions-table";

export default function SubmissionsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage photo submissions from participants
        </p>
      </div>

      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">By Participant</TabsTrigger>
          <TabsTrigger value="topics">By Topic</TabsTrigger>
        </TabsList>
        <TabsContent value="participants" className="mt-6">
          <ParticipantSubmissionsTable />
        </TabsContent>
        <TabsContent value="topics" className="mt-6">
          <div className="text-muted-foreground">Topic view coming soon...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
