import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@vimmer/ui/components/card";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
