"use server";

import { actionClient } from "@/actions/safe-action";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const selectDomainSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  type: z.enum(["admin", "staff"]).optional().default("admin"),
});

export const selectDomain = actionClient
  .schema(selectDomainSchema)
  .action(async ({ parsedInput: { domain, type } }) => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ domain })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    const cookieStore = await cookies();

    cookieStore.set({
      name: "activeDomain",
      value: domain,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    cookieStore.set({
      name: "domainAccessToken",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    if (process.env.NODE_ENV === "development") {
      redirect(`http://${domain}.localhost:3000/${type}`);
    } else {
      redirect(`https://${domain}.blikka.app/${type}`);
    }
  });
