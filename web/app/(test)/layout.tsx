export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Test mode indicator */}
      <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground px-3 py-1 rounded text-xs font-mono shadow-lg">
        TEST MODE
      </div>
      {children}
    </div>
  );
}
