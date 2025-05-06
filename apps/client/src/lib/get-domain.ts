import { headers } from "next/headers";
import "server-only";

export async function getDomain() {
  const headersList = await headers();
  const domain = headersList.get("x-domain");
  if (!domain) throw new Error("Domain not found");
  if (domain === "localhost") return "dev0";
  return domain;
}
