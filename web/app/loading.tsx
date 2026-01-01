import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--surface-dark))] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[hsl(var(--brand-primary))] animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
