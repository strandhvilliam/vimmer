import { Suspense } from "react";
import { AdminLoginForm } from "../../../../../components/auth/admin-login-form";
import { AdminLoginTitle } from "../../../../../components/auth/admin-login-title";
import { AdminLoginFormSkeleton } from "../../../../../components/auth/admin-login-form-skeleton";

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
