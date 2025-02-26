// app/domains/components/contact-domain-button.tsx
"use client";

import { Button } from "@vimmer/ui/components/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@vimmer/ui/components/dialog";
import { Input } from "@vimmer/ui/components/input";
import { Label } from "@vimmer/ui/components/label";
import { Textarea } from "@vimmer/ui/components/textarea";
import { useState } from "react";

export function ContactDomainButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    // Form data handling
    const formData = new FormData(event.currentTarget);
    const domainName = formData.get("domain-name") as string;
    const message = formData.get("message") as string;

    try {
      // Here you would implement your API call to send the contact request
      // await sendDomainRequest({ domainName, message });

      // Close dialog on success
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to send domain request:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Contact domain organizer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact a domain organizer</DialogTitle>
          <DialogDescription>
            Provide the domain name and a message to request access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="domain-name">Domain name</Label>
              <Input
                id="domain-name"
                name="domain-name"
                placeholder="Enter the domain name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Explain why you need access to this domain"
                className="min-h-[120px]"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
