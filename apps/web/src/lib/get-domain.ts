import { headers } from "next/headers";
import "server-only";

const DEV_DOMAIN = "demo";

export async function getDomain() {
  const headersList = await headers();
  const domain = headersList.get("x-domain");
  if (!domain) throw new Error("Domain not found");
  if (domain === "localhost" || domain.startsWith("192")) return DEV_DOMAIN;
  return domain;
}
