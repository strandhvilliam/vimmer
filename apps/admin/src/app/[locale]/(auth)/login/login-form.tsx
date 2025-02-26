"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@vimmer/ui/components/button";
import { Input } from "@vimmer/ui/components/input";
import { Label } from "@vimmer/ui/components/label";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface LoginFormData {
  email: string;
}

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
      
      toast({
        title: "Check your email",
        description: "We've sent you a verification code.",
      });
      
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
          disabled={isLoading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send verification code
      </Button>
    </form>
  );
} 