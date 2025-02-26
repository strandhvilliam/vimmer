import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
          <CardDescription>Please wait while we process your request</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
} 