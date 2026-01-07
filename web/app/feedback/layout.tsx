import { Footer } from "@/components/sections/footer";

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[hsl(var(--surface-dark))]">
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
