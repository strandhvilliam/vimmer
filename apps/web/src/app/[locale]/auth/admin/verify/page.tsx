import { redirect } from "next/navigation"
import { Suspense } from "react"
import { AdminVerifyForm } from "./admin-verify-form"

interface PageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function AdminVerifyPage({ searchParams }: PageProps) {
  const { email } = await searchParams

  if (!email) {
    redirect("/auth/admin/login")
  }

  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify your email
          </h1>
          <div className="text-sm text-muted-foreground">
            Enter the verification code sent to <span>{email}</span>
          </div>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <AdminVerifyForm email={email} />
        </Suspense>
      </div>
    </div>
  )
}
