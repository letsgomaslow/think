import { DesignTestimonial } from "@/components/test/testimonial/design-testimonial";

export default function TestimonialPage() {
  return (
    <main>
      {/* Header for context */}
      <div className="py-8 px-6 border-b border-border bg-card">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Component Test
          </p>
          <h1 className="text-2xl font-semibold text-foreground">
            Testimonial Section
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Testing framer-motion animations, brand token integration, and typography
          </p>
        </div>
      </div>

      {/* Component under test */}
      <DesignTestimonial />

      {/* Observation notes */}
      <div className="py-12 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">Observations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card p-4 rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
              <h3 className="font-medium mb-2">Brand Token Usage</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Background: hsl(var(--background))</li>
                <li>Accent color: hsl(var(--secondary))</li>
                <li>Border: hsl(var(--border))</li>
                <li>Muted text: hsl(var(--muted-foreground))</li>
              </ul>
            </div>
            <div className="bg-card p-4 rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
              <h3 className="font-medium mb-2">Animation Features</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Auto-rotate: 6s interval</li>
                <li>Word-by-word reveal: 50ms stagger</li>
                <li>Magnetic parallax: Spring physics</li>
                <li>Company ticker: Infinite scroll</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
