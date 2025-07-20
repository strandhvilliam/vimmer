"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@vimmer/ui/components/input";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });

      if (error) throw error;
      router.push(`/auth/staff/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send verification code", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 flex flex-col gap-4 items-center w-full"
    >
      <div className="space-y-2 w-full">
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-12"
          disabled={isLoading}
        />
      </div>

      <PrimaryButton
        type="submit"
        className="rounded-full py-3 px-12 text-base"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className=" mr-2 h-4 w-4 animate-spin" />}
        Send Verification Code
      </PrimaryButton>
    </form>
  );
}
