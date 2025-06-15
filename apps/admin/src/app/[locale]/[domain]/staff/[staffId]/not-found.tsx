import { User2Icon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <User2Icon className="h-12 w-12 mb-4" />
      <h2 className="text-lg font-medium mb-2">Staff Not Found</h2>
      <p>The staff member you are looking for does not exist</p>
    </div>
  );
}
