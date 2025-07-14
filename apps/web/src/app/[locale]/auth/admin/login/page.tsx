import { Suspense } from "react";
import { AdminLoginForm } from "./admin-login-form";
import { AdminLoginTitle } from "./admin-login-title";
import { AdminLoginFormSkeleton } from "./admin-login-form-skeleton";

export default function AdminLoginPage() {
  return (
    <>
      <div className="w-full max-w-md">
        <AdminLoginTitle />
        <div className="mt-0 w-full">
          <Suspense fallback={<AdminLoginFormSkeleton />}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
