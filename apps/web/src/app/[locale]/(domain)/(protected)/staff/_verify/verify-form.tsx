"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { Input } from "@vimmer/ui/components/input";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

interface VerifyFormProps {
  email: string;
}

export function VerifyForm({ email }: VerifyFormProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log({ otp });
      const { data, error } = await authClient.signIn.emailOtp({
        email,
        otp,
      });

      console.log({ data, error });
      if (error) throw error;

      toast.success("Login successful");
      router.push("/staff");
    } catch (error: any) {
      toast.error("Verification failed", {
        description: error?.message || "Please check the code and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendCode() {
    setIsLoading(true);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) throw error;

      toast.success("Verification code sent");
    } catch (error: any) {
      toast.error("Failed to send code", {
        description: error?.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div className="space-y-2">
        <Input
          id="otp"
          type="text"
          placeholder="Verification code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="w-full"
          disabled={isLoading}
        />
      </div>

      <PrimaryButton
        type="submit"
        className="py-3 text-base rounded-full w-full"
        disabled={isLoading || otp.length === 0}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Verify
      </PrimaryButton>

      <div className="pt-2 text-center">
        <Button
          type="button"
          variant="link"
          onClick={handleResendCode}
          disabled={isLoading}
        >
          Resend code
        </Button>
      </div>
    </form>
  );
}
