import { Suspense } from "react";
import AuthLoading from "./loading";
import { LanguageToggle } from "./components/language-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>
        {children}
    </div>
  );
} 