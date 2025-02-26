"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@vimmer/ui/components/button";
import { Label } from "@vimmer/ui/components/label";
import { toast } from "@vimmer/ui/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@vimmer/ui/components/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@vimmer/ui/components/form";

interface VerifyFormProps {
  email: string;
}

const verifyFormSchema = z.object({
  otp: z.string().length(6, "Please enter a valid 6-digit code"),
});

type VerifyFormValues = z.infer<typeof verifyFormSchema>;

export function VerifyForm({ email }: VerifyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(data: VerifyFormValues) {
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp: data.otp,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        form.setError("otp", {
          message: "Invalid verification code. Please try again.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "You have been signed in successfully.",
      });
      
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
      form.reset();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor="otp">Verification Code</Label>
              <FormControl>
                <InputOTP
                  pattern={REGEXP_ONLY_DIGITS}
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>
      </form>
    </Form>
  );
} 