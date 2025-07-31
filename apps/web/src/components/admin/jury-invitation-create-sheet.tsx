import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@vimmer/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@vimmer/ui/components/sheet";
import { Textarea } from "@vimmer/ui/components/textarea";
import { toast } from "sonner";
import { sendInvitationEmailAction } from "@/lib/actions/send-jury-invitation-email";
import { useDomain } from "@/contexts/domain-context";
import { z } from "zod/v4";
import { Input } from "@vimmer/ui/components/input";
import { Send } from "lucide-react";
import { addDays } from "date-fns";
import { useForm } from "@tanstack/react-form";

interface JuryInvitationCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  displayName: z.string(),
  email: z.email({ message: "Invalid email address." }),
  notes: z.string().optional(),
  competitionClassId: z.string().optional(),
  deviceGroupId: z.string().optional(),
  topicId: z.string().optional(),
  expiryDays: z
    .number()
    .min(1, { message: "Expiry must be at least 1 day." })
    .max(90, { message: "Expiry cannot exceed 90 days." })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function JuryInvitationCreateSheet({
  open,
  onOpenChange,
}: JuryInvitationCreateSheetProps) {
  const { domain } = useDomain();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: competitionClasses } = useSuspenseQuery(
    trpc.competitionClasses.getByDomain.queryOptions({
      domain,
    }),
  );

  const { data: topics } = useSuspenseQuery(
    trpc.topics.getByDomain.queryOptions({
      domain,
    }),
  );

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
  );

  const { data: deviceGroups } = useSuspenseQuery(
    trpc.deviceGroups.getByDomain.queryOptions({
      domain,
    }),
  );

  const { mutate: createJuryInvitation, isPending: isCreatingJuryInvitation } =
    useMutation(
      trpc.jury.createJuryInvitation.mutationOptions({
        onSuccess: async (invitationData) => {
          if (!invitationData) {
            toast.error("Failed to send jury invitation");
            return;
          }
          if (!marathon) {
            toast.error("Failed to send jury invitation");
            return;
          }

          const competitionClass = competitionClasses.find(
            (cls) => cls.id === invitationData.competitionClassId,
          );
          const topic = topics.find(
            (topic) => topic.id === invitationData.topicId,
          );

          await sendInvitationEmailAction({
            domain,
            email: invitationData.email,
            token: invitationData.token,
            expiresAt: new Date(invitationData.expiresAt),
            competitionClass: competitionClass?.name ?? "All classes",
            topic: topic?.name ?? "All topics",
            invitationId: invitationData.id,
            marathonName: marathon.name,
            displayName: invitationData.displayName,
          });
          toast.success("Jury invitation sent");
          form.reset();
          onOpenChange(false);
        },
        onError: (error) => {
          console.error(error);
          toast.error("Failed to send jury invitation");
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.jury.pathKey(),
          });
        },
      }),
    );

  const form = useForm({
    defaultValues: {
      displayName: "",
      email: "",
      notes: "",
      competitionClassId: "all",
      deviceGroupId: "all",
      topicId: "all",
      expiryDays: 14,
    } as FormValues,
    onSubmit: async ({ value }) => {
      if (!marathon) {
        toast.error("Failed to send jury invitation");
        return;
      }

      const parsedCompetitionClassId =
        !value.competitionClassId || value.competitionClassId === "all"
          ? undefined
          : parseInt(value.competitionClassId);
      const parsedDeviceGroupId =
        !value.deviceGroupId || value.deviceGroupId === "all"
          ? undefined
          : parseInt(value.deviceGroupId);

      const parsedTopicId =
        !value.topicId || value.topicId === "all"
          ? undefined
          : parseInt(value.topicId);

      const expiresAt = addDays(new Date(), value.expiryDays ?? 14);
      expiresAt.setHours(23, 59, 59, 999);

      const data = {
        displayName: value.displayName,
        email: value.email,
        token: "",
        expiresAt: expiresAt.toISOString(),
        competitionClassId: parsedCompetitionClassId,
        deviceGroupId: parsedDeviceGroupId,
        topicId: parsedTopicId,
        notes: value.notes,
        domain,
        status: "pending",
        marathonId: marathon.id,
      };

      console.log({ data });

      createJuryInvitation({
        data,
      });
    },

    validators: {
      onSubmit: formSchema,
    },
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Create Jury Invitation</SheetTitle>
          <SheetDescription>
            Send an invitation to a jury member to rate submissions. The link
            will contain a secure token valid for the specified period.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-6 py-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return "Email is required";
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return !emailRegex.test(value)
                  ? "Invalid email address"
                  : undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="jury-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Jury Member Email
                </label>
                <Input
                  id="jury-email"
                  type="email"
                  placeholder="jury@example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="mt-2"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {typeof field.state.meta.errors[0] === "string"
                      ? field.state.meta.errors[0]
                      : "Invalid input"}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="displayName"
            validators={{
              onChange: ({ value }) => {
                return !value ? "Display name is required" : undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="jury-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Display Name
                </label>
                <Input
                  id="jury-name"
                  placeholder="John Doe"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="mt-2"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {typeof field.state.meta.errors[0] === "string"
                      ? field.state.meta.errors[0]
                      : "Invalid input"}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="expiryDays"
            validators={{
              onChange: ({ value }) => {
                const num = Number(value);
                if (num < 1) return "Expiry must be at least 1 day";
                if (num > 90) return "Expiry cannot exceed 90 days";
                return undefined;
              },
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor="expiry"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Expiry (days)
                </label>
                <Input
                  id="expiry"
                  type="number"
                  min="1"
                  max="90"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  onBlur={field.handleBlur}
                  className="mt-2"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {typeof field.state.meta.errors[0] === "string"
                      ? field.state.meta.errors[0]
                      : "Invalid input"}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="competitionClassId">
            {(field) => (
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Competition Class (Optional)
                </label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a competition class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classes</SelectItem>
                    {competitionClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {typeof field.state.meta.errors[0] === "string"
                      ? field.state.meta.errors[0]
                      : "Invalid input"}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="deviceGroupId">
            {(field) => (
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Device Group (Optional)
                </label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a device group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All device groups</SelectItem>
                    {deviceGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {typeof field.state.meta.errors[0] === "string"
                      ? field.state.meta.errors[0]
                      : "Invalid input"}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="topicId">
            {(field) => (
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Topic (Optional)
                </label>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All topics</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id.toString()}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {typeof field.state.meta.errors[0] === "string"
                      ? field.state.meta.errors[0]
                      : "Invalid input"}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <div>
                <label
                  htmlFor="notes"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Notes (Optional)
                </label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes for the jury member..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="mt-2"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {typeof field.state.meta.errors[0] === "string"
                      ? field.state.meta.errors[0]
                      : "Invalid input"}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <SheetFooter className="pt-4">
            <form.Subscribe
              selector={(formState) => [
                formState.canSubmit,
                formState.isSubmitting,
              ]}
            >
              {([canSubmit, isSubmitting]) => (
                <PrimaryButton
                  type="submit"
                  disabled={!canSubmit || isCreatingJuryInvitation}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send Invitation"}
                </PrimaryButton>
              )}
            </form.Subscribe>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
