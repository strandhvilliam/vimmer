"use server";

import { authClient } from "../auth-client";
import { actionClient } from "./safe-action";
import { z } from "zod";
import { selectDomain } from "./select-domain";

export const staffOtpSignIn = actionClient
  .schema(
    z.object({
      email: z.string().email(),
      otp: z.string(),
      domain: z.string(),
    }),
  )
  .action(async ({ parsedInput: { email, otp, domain } }) => {
    const { data, error } = await authClient.signIn.emailOtp({
      email,
      otp,
    });

    if (error || !data) throw error;

    return data;
  });
