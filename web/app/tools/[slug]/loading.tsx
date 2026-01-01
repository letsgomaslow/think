export default function ToolLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Hero Section Skeleton */}
      <section className="text-center mb-16">
        {/* Icon skeleton */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800/50 animate-pulse" />

        {/* Badge skeleton */}
        <div className="w-32 h-7 mx-auto mb-4 rounded-full bg-slate-800/50 animate-pulse" />

        {/* Title skeleton */}
        <div className="w-96 max-w-full h-12 mx-auto mb-4 rounded bg-slate-800/50 animate-pulse" />

        {/* Tagline skeleton */}
        <div className="w-80 max-w-full h-8 mx-auto mb-4 rounded bg-slate-800/50 animate-pulse" />

        {/* Description skeleton */}
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="h-5 rounded bg-slate-800/50 animate-pulse" />
          <div className="h-5 rounded bg-slate-800/50 animate-pulse w-3/4 mx-auto" />
        </div>
      </section>

      {/* Demo Section Skeleton */}
      <section className="mb-16">
        <div className="h-6 w-32 mb-4 rounded bg-slate-800/50 animate-pulse" />
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
            <div className="h-5 w-96 max-w-full rounded bg-slate-700/50 animate-pulse" />
          </div>
          <div className="p-6 min-h-[200px]" />
        </div>
      </section>

      {/* When to Use Section Skeleton */}
      <section className="mb-16">
        <div className="h-6 w-48 mb-6 rounded bg-slate-800/50 animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-slate-800/30 border border-slate-700/30 animate-pulse"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
