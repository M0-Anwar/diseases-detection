export default function Loading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-8 w-48 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        {/* Skeleton loaders for mutation summary */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="h-6 w-40 bg-muted rounded-lg mb-4 animate-pulse"></div>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-24 bg-muted rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Skeleton loaders for disease cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="h-6 w-56 bg-muted rounded-lg animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
