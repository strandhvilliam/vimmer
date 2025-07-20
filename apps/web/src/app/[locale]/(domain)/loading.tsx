import { ActivitySquare } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <img src="/vimmer-black.svg" alt="Vimmer Logo" className="w-12 h-12" />
        <div className="flex gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" />
          <div className="h-2 w-2 rounded-full bg-primary animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
          <div className="h-2 w-2 rounded-full bg-primary animate-[bounce_1s_ease-in-out_0.4s_infinite]" />
        </div>
      </div>
    </div>
  );
}
