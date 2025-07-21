"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Label } from "@vimmer/ui/components/label";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@vimmer/ui/components/input-otp";
import { useState } from "react";

interface VerifyFormProps {
  email: string;
}

const verifyFormSchema = z.object({
  otp: z.string().length(6, "Please enter a valid 6-digit code"),
});

export function AdminVerifyForm({ email }: VerifyFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { otp: "" },
    onSubmit: async ({ value }) => {
      try {
        const { error } = await authClient.signIn.emailOtp({
          email,
          otp: value.otp,
        });
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          setError("Invalid verification code. Please try again.");
          return;
        }
        toast({
          title: "Success",
          description: "You have been signed in successfully.",
        });
        router.push("/select-domain");
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Invalid verification code. Please try again.",
          variant: "destructive",
        });
        setError("Invalid verification code. Please try again.");
      }
    },
    validators: {
      onChange: verifyFormSchema,
      onMount: verifyFormSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="grid gap-6"
    >
      <form.Field
        name="otp"
        children={(field) => (
          <div className="space-y-3">
            <Label htmlFor="otp" className="text-sm font-medium">
              Enter Code
            </Label>
            <InputOTP
              pattern={REGEXP_ONLY_DIGITS}
              maxLength={6}
              value={field.state.value}
              onChange={(value) => field.handleChange(value.toString())}
              disabled={form.state.isSubmitting}
              className="gap-2"
            >
              <InputOTPGroup className="bg-background">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>
        )}
      />
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <PrimaryButton
            type="submit"
            className="w-full font-semibold"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </PrimaryButton>
        )}
      />
    </form>
  );
}
