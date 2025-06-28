import { connection } from "next/server";
import { Suspense } from "react";

export default async function SubmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // await connection();
  return children;
}
