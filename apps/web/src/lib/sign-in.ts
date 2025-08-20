"use server";

import { auth } from "./auth";

export async function signInWithPassword(email: string, password: string) {
  if (password !== "12345") {
    throw new Error("Invalid password");
  }

  return auth.api.signInEmail({
    body: {
      email,
      password: "12345",
    },
  });
}
