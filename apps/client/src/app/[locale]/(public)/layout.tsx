import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //   const headersList = await headers();
  //   const hostDomain = headersList.get("x-domain")?.split(".").at(0);
  //   console.log("hostDomain", hostDomain);
  //   if (hostDomain) {
  //     return redirect(`/participate`);
  //   }

  return <div>{children}</div>;
}
