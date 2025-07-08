import { Suspense } from "react";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import { redirect } from "next/navigation";
import { VerifyForm } from "./verify-form";

type PageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function VerifyPage({ searchParams }: PageProps) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/staff/login");
  }

  return (
    <div className="flex flex-col items-center justify-center  pb-20">
      <DotPattern />
      <div className="w-full flex justify-center pt-20 pb-10 flex-col items-center gap-2">
        <h1 className="text-4xl font-bold font-rocgrotesk">Verify</h1>
        <p className="text-muted-foreground text-lg font-rocgrotesk text-center">
          Enter the verification code sent to {email}
        </p>
      </div>
      <div className="w-full max-w-sm px-6">
        <Suspense fallback={<div>Loading...</div>}>
          <VerifyForm email={email} />
        </Suspense>
      </div>
    </div>
  );
}
