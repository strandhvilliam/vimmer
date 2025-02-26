import { redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@vimmer/ui/components/card";
import { VerifyForm } from "./verify-form";

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}
export default async function VerifyPage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
        <CardDescription>
          Enter the verification code sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyForm email={email} />
      </CardContent>
    </Card>
    </div>
  );
} 