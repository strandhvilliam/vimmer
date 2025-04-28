"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@vimmer/ui/components/sheet";
import { Button } from "@vimmer/ui/components/button";
import { Input } from "@vimmer/ui/components/input";
import { Label } from "@vimmer/ui/components/label";
import { Textarea } from "@vimmer/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import { Send } from "lucide-react";
import { toast } from "@vimmer/ui/hooks/use-toast";

import {
  createJuryInvitation,
  generateJuryToken,
} from "@vimmer/supabase/mutations";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

// Mock data for dropdowns
const MOCK_CLASSES = [
  { id: 1, name: "Open Class" },
  { id: 2, name: "Junior Class" },
  { id: 3, name: "Professional" },
];

const MOCK_DEVICE_GROUPS = [
  { id: 1, name: "DSLR" },
  { id: 2, name: "Smartphone" },
  { id: 3, name: "Mirrorless" },
];

const MOCK_TOPICS = [
  { id: 1, name: "Nature" },
  { id: 2, name: "Urban" },
  { id: 3, name: "Portrait" },
  { id: 4, name: "Abstract" },
];

interface CreateInvitationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvitationSheet({
  open,
  onOpenChange,
}: CreateInvitationSheetProps) {
  const marathonId = 1; // This would come from your domain context in a real app

  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [competitionClassId, setCompetitionClassId] = useState<string>("");
  const [deviceGroupId, setDeviceGroupId] = useState<string>("");
  const [topicId, setTopicId] = useState<string>("");
  const [expiryDays, setExpiryDays] = useState<string>("14");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setNotes("");
    setCompetitionClassId("");
    setDeviceGroupId("");
    setTopicId("");
    setExpiryDays("14");
  };

  const handleSendInvitation = async () => {
    if (!email) {
      toast({
        title: "Missing information",
        description: "Please enter an email address for the jury member",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate an expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

      // Parse selected filter IDs
      const parsedCompetitionClassId = competitionClassId
        ? parseInt(competitionClassId)
        : null;
      const parsedDeviceGroupId = deviceGroupId
        ? parseInt(deviceGroupId)
        : null;
      const parsedTopicId = topicId ? parseInt(topicId) : null;

      // Generate a token for the jury invitation
      const token = await generateJuryToken(
        marathonId,
        parsedCompetitionClassId,
        parsedDeviceGroupId,
        parsedTopicId
      );

      // Create the invitation
      await createJuryInvitation({
        marathon_id: marathonId,
        email,
        notes: notes || null,
        status: "pending",
        token,
        sent_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        competition_class_id: parsedCompetitionClassId,
        device_group_id: parsedDeviceGroupId,
        topic_id: parsedTopicId,
      });

      toast({
        title: "Invitation sent",
        description: `Jury invitation sent to ${email}`,
      });

      // Close the sheet and reset form
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to send jury invitation:", error);
      toast({
        title: "Error",
        description: "Failed to send jury invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Create Jury Invitation</SheetTitle>
          <SheetDescription>
            Send an invitation to a jury member to rate submissions. The link
            will contain a secure token valid for the specified period.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="jury-email">Jury Member Email</Label>
            <Input
              id="jury-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="expiry">Expiry (days)</Label>
            <Input
              id="expiry"
              type="number"
              min="1"
              max="90"
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional instructions for the jury member"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Filter Submissions</h3>
            <p className="text-sm text-muted-foreground">
              Optionally restrict which submissions this jury member will rate
            </p>

            <div className="space-y-3">
              <div>
                <Label htmlFor="competition-class">Competition Class</Label>
                <Select
                  value={competitionClassId}
                  onValueChange={setCompetitionClassId}
                >
                  <SelectTrigger id="competition-class">
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CLASSES.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="device-group">Device Group</Label>
                <Select value={deviceGroupId} onValueChange={setDeviceGroupId}>
                  <SelectTrigger id="device-group">
                    <SelectValue placeholder="All devices" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_DEVICE_GROUPS.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="topic">Topic</Label>
                <Select value={topicId} onValueChange={setTopicId}>
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="All topics" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TOPICS.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="pt-4">
          <PrimaryButton onClick={handleSendInvitation} disabled={loading}>
            <Send className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send Invitation"}
          </PrimaryButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
