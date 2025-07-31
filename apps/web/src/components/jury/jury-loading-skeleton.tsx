export function JuryLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="flex w-full border-b items-center h-16 px-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-neutral-800 rounded animate-pulse" />
          <div className="flex flex-col">
            <div className="h-5 w-48 bg-neutral-800 rounded animate-pulse mb-1" />
            <div className="h-3 w-32 bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-md">
          <div className="h-8 w-32 bg-neutral-800 rounded animate-pulse mb-4 mx-auto" />
          <div className="h-4 w-64 bg-neutral-800 rounded animate-pulse" />
        </div>
      </div>
    </main>
  );
}
