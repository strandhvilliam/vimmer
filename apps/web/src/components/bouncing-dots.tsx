export function BouncingDots() {
  return (
    <div className="flex gap-2">
      <div className="h-2 w-2 rounded-full bg-primary animate-[bounce_1s_ease-in-out_infinite]" />
      <div className="h-2 w-2 rounded-full bg-primary animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
      <div className="h-2 w-2 rounded-full bg-primary animate-[bounce_1s_ease-in-out_0.4s_infinite]" />
    </div>
  );
}
