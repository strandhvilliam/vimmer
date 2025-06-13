"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, AlertTriangle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@vimmer/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vimmer/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@vimmer/ui/components/form";
import { Input } from "@vimmer/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@vimmer/ui/components/alert";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { addStaffMemberAction } from "../_actions/add-staff-member";
import { addStaffMemberSchema } from "../_utils/staff-schemas";

type AddStaffFormValues = z.infer<typeof addStaffMemberSchema>;

export function AddStaffDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm<AddStaffFormValues>({
    resolver: zodResolver(addStaffMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "staff",
    },
  });

  const { execute, isExecuting } = useAction(addStaffMemberAction, {
    onSuccess: () => {
      setIsOpen(false);
      setErrorMessage(null);
      form.reset();
    },
    onError: (error) => {
      console.error("Failed to add staff member:", error.error.serverError);
      setErrorMessage(error.error.serverError || "Failed to add staff member");
    },
  });

  async function onSubmit(data: AddStaffFormValues) {
    setErrorMessage(null);
    execute(data);
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setErrorMessage(null);
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <PrimaryButton>
          <Plus className="h-4 w-4" />
          <span className="hidden md:block text-sm">Add Staff</span>
        </PrimaryButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-rocgrotesk">
            Add Staff Member
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <Alert
                variant="destructive"
                className="flex items-center gap-2 bg-red-50"
              >
                <AlertTriangle className="h-4 w-4" />
                {/* <AlertTitle /> */}
                <AlertDescription className="leading-none mt-1">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Anna Johnson" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="anna.johnson@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isExecuting}
              >
                Cancel
              </Button>
              <PrimaryButton type="submit" disabled={isExecuting}>
                {isExecuting ? "Adding..." : "Add Staff Member"}
              </PrimaryButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
