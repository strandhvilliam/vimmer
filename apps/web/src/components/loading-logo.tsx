import { BouncingDots } from "./bouncing-dots";

export function LoadingLogo() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <img src="/vimmer-black.svg" alt="Vimmer Logo" className="w-12 h-12" />
        <BouncingDots />
      </div>
    </div>
  );
}
