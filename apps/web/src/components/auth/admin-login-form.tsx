"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Input } from "@vimmer/ui/components/input";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Card, CardContent } from "@vimmer/ui/components/card";
import Link from "next/link";
import { toast } from "sonner";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { authClient } from "@/lib/auth-client";
import { Button } from "@vimmer/ui/components/button";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      router.push(`/auth/admin/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.", {
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="w-full border-0 shadow-none">
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
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

            <PrimaryButton
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Login Code
            </PrimaryButton>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">
              Don't have an account?{" "}
            </span>
            <Link
              href="/sign-up"
              className="font-medium text-neutral-900 hover:text-neutral-700 dark:text-white dark:hover:text-neutral-300"
            >
              Request Access
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
