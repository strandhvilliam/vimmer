import { Suspense } from "react";
import { LoginForm } from "../_components/login-form";
import { LoginFormSkeleton } from "../_components/login-form-skeleton";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";

export default function StaffLoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100svh] pb-20">
      <DotPattern />
      <div className="w-full flex justify-center pt-20 pb-6 flex-col items-center gap-2">
        <h1 className="text-4xl font-bold font-rocgrotesk">Staff Login</h1>
        <p className="text-muted-foreground text-lg font-rocgrotesk">
          Enter your credentials to continue
        </p>
      </div>
      <div className="w-full max-w-md px-6">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
