import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { LanguageToggle } from "../components/language-toggle";
import { LoginTitle } from "./login-title";
import { LoginFormSkeleton } from "./login-form-skeleton";
import Image from "next/image";
import { BlurFade } from "@vimmer/ui/components/blur-fade";

export default function LoginPage() {
  return (
    <>
      <div className="w-full max-w-md">
        <LoginTitle />
        <div className="mt-0 w-full">
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
