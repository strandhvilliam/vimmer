"use client";

import { useState } from "react";
import { FieldApi, useForm } from "@tanstack/react-form";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vimmer/ui/components/dialog";
import { Input } from "@vimmer/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select";
import { Alert, AlertDescription } from "@vimmer/ui/components/alert";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { sendStaffInviteEmail } from "../_actions/send-staff-invite-email";
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useDomain } from "@/contexts/domain-context";
import { useSession } from "@/hooks/use-session";

export function AddStaffDialog() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { domain } = useDomain();
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get marathon data for email
  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    })
  );

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "staff",
    },
    onSubmit: async ({ value }) => {
      setErrorMessage(null);
      // Transform the form data to match the expected schema
      const staffData = {
        data: {
          marathonId: marathon?.id || 0,
          name: value.name,
          email: value.email,
          role: value.role as "staff" | "admin",
        },
      };
      addStaffMember(staffData);
    },
  });

  const { mutate: addStaffMember, isPending: isAddingStaffMember } =
    useMutation(
      trpc.users.createStaffMember.mutationOptions({
        onError: (error) => {
          console.error("Failed to add staff member:", error);
          setErrorMessage("Failed to add staff member");
        },
        onSuccess: async (data, variables) => {
          try {
            await sendStaffInviteEmail({
              name: variables.data.name,
              email: variables.data.email,
              marathonName: marathon?.name || "",
              inviterName: user?.name || "",
              domain: domain,
            });
          } catch (error) {
            console.error(error);
            toast.error("Failed to send email");
          }

          setIsOpen(false);
          setErrorMessage(null);
          form.reset();
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.users.pathKey(),
          });
          queryClient.invalidateQueries({
            queryKey: trpc.validations.pathKey(),
          });
        },
      })
    );

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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {errorMessage && (
            <Alert
              variant="destructive"
              className="flex items-center gap-2 bg-red-50"
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="leading-none mt-1">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value ? "Name is required" : undefined,
            }}
            children={(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Name
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Anna Johnson"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <em className="text-sm text-red-600">
                      {field.state.meta.errors.join(", ")}
                    </em>
                  )}
              </div>
            )}
          />

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return "Invalid email address";
                }
                return undefined;
              },
            }}
            children={(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Email
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="anna.johnson@example.com"
                />
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <em className="text-sm text-red-600">
                      {field.state.meta.errors.join(", ")}
                    </em>
                  )}
              </div>
            )}
          />

          <form.Field
            name="role"
            validators={{
              onChange: ({ value }) =>
                !value ? "Role is required" : undefined,
            }}
            children={(field) => (
              <div className="space-y-2">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Role
                </label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0 && (
                    <em className="text-sm text-red-600">
                      {field.state.meta.errors.join(", ")}
                    </em>
                  )}
              </div>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isAddingStaffMember}
            >
              Cancel
            </Button>
            <PrimaryButton type="submit" disabled={isAddingStaffMember}>
              {isAddingStaffMember ? "Adding..." : "Add Staff Member"}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
