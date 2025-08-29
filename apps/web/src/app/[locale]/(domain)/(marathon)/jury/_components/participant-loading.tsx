export function ParticipantListLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="h-10 w-80 bg-neutral-800 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-neutral-900 border border-neutral-700 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-neutral-700 rounded-full animate-pulse" />
                <div>
                  <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-neutral-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 bg-neutral-700 rounded animate-pulse" />
              <div className="h-4 w-20 bg-neutral-700 rounded animate-pulse" />
            </div>
            <div className="flex gap-1">
              <div className="h-5 w-16 bg-neutral-700 rounded animate-pulse" />
              <div className="h-5 w-12 bg-neutral-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
