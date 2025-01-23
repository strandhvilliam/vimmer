import { connection } from "next/server";
import { SubmissionClientPage } from "./client-page";

export default async function SubmissionPage() {
  await connection();
  return <SubmissionClientPage />;
}
