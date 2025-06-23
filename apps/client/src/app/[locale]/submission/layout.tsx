import { connection } from "next/server";

export default async function SubmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // await connection();
  return children;
}
