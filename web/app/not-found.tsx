import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[hsl(var(--surface-dark))] flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        {/* 404 with gradient */}
        <h1 className="text-9xl font-bold mb-4 bg-gradient-to-r from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-accent))] to-[hsl(var(--brand-primary))] bg-clip-text text-transparent font-[family-name:var(--font-manrope)]">
          404
        </h1>

        {/* Message */}
        <h2 className="text-3xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
          Page Not Found
        </h2>
        <p className="text-lg text-slate-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Back to Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.85)] text-white font-semibold transition-all duration-300 shadow-[0_10px_25px_hsl(var(--brand-primary)/0.4)] hover:shadow-[0_15px_35px_hsl(var(--brand-primary)/0.5)]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
