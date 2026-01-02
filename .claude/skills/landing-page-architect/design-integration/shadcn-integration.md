# Shadcn Integration Guide

How to use Shadcn components while maintaining brand consistency.

> **Portability:** This guide uses semantic token names. Actual values come from `brand-config.md` and are applied via `globals.css`.

---

## Overview

Shadcn/ui uses CSS variables that components inherit automatically. By mapping brand tokens to these variables, Shadcn components adopt brand styling out-of-the-box.

**Key Principle:** Set brand tokens at the CSS variable level, not per-component.

---

## Component Compatibility Matrix

### Works Out-of-Box (No Override Needed)

| Component | Inherits From | Result |
|-----------|---------------|--------|
| Button (default) | --primary | Dark CTA button |
| Button (secondary) | --secondary | Accent color button |
| Input | --border, --ring | Border with focus ring |
| Dialog | --card | White surface |
| Dropdown Menu | --popover | White menu |
| Tabs | --muted | Gray tabs, accent active |
| Avatar | --secondary | Accent fallback |
| Separator | --border | Gray line |
| Skeleton | --muted | Gray pulse |

### Needs Brand Override

| Component | Issue | Override Needed |
|-----------|-------|-----------------|
| **Card** | Default radius may differ | Add `rounded-[var(--radius-card)]` |
| **Badge** | Default radius too large | Add `rounded-[var(--radius-badge)]` |
| **Alert** | Default colors don't match | Use brand colors explicitly |

### Custom Components (Not in Shadcn)

These components don't exist in Shadcn - use the CSS templates from `component-patterns.md`:

| Component | Use Case | Template Location |
|-----------|----------|-------------------|
| **Feature Card** | Case study cards | `component-patterns.md#feature-card` |
| **Status Badge** | Open/closed indicators | `component-patterns.md#status-badge` |
| **Stats Module** | Statistics dark band | `component-patterns.md#stats-module` |
| **Accent Headline** | Accent first word | `component-patterns.md#accent-headline` |
| **Content Panel** | Large radius modules | `component-patterns.md#content-panel` |
| **List Item** | News/blog lists | `component-patterns.md#list-item` |

---

## CSS Variable Mapping

Add this structure to your `globals.css` to enable automatic brand inheritance. Replace values with those from your `brand-config.md`:

```css
@layer base {
  :root {
    /* === CORE SHADCN VARIABLES === */

    /* Backgrounds - from brand-config surface tokens */
    --background: /* HSL from surface-background */;
    --foreground: /* HSL from color-foreground */;

    /* Card - from brand-config surface tokens */
    --card: /* HSL from surface-card */;
    --card-foreground: /* HSL from color-foreground */;

    /* Popover - typically same as card */
    --popover: /* HSL from surface-card */;
    --popover-foreground: /* HSL from color-foreground */;

    /* Primary (Dark CTA) - from brand-config */
    --primary: /* HSL from color-secondary (dark) */;
    --primary-foreground: 0 0% 100%; /* white */

    /* Secondary (Accent) - from brand-config */
    --secondary: /* HSL from color-primary (accent) */;
    --secondary-foreground: 0 0% 100%; /* white */

    /* Muted - from brand-config */
    --muted: /* HSL from surface-muted */;
    --muted-foreground: /* HSL from color-muted */;

    /* Accent - from brand-config */
    --accent: /* HSL from color-accent */;
    --accent-foreground: /* HSL from color-foreground */;

    /* Destructive - standard red */
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;

    /* Border & Input - from brand-config */
    --border: /* HSL from color-border */;
    --input: /* HSL from color-border */;
    --ring: /* HSL from color-primary (focus color) */;

    /* CRITICAL: Radius from brand-config */
    --radius: /* from radius-card, e.g., 0.25rem for 4px */;

    /* === EXTENDED BRAND VARIABLES === */

    /* Statistics accents - from brand-config */
    --stat-1: /* HSL from color-stat-1 */;
    --stat-2: /* HSL from color-stat-2 */;
    --stat-3: /* HSL from color-stat-3 */;

    /* CTA variants - from brand-config */
    --cta: /* HSL from color-cta */;
    --cta-submit: /* HSL from color-cta-submit */;

    /* Shadows - from brand-config */
    --shadow-card: /* from shadow-card */;
    --shadow-card-hover: /* from shadow-card-hover */;
    --shadow-marquee: /* from shadow-marquee */;
    --shadow-elevated: /* from shadow-elevated */;

    /* Content panel radius - from brand-config */
    --radius-panel: /* from radius-panel */;
  }

  /* Dark Mode (for dark band sections) */
  .dark {
    --background: /* HSL from surface-dark */;
    --foreground: 0 0% 100%;
    --card: /* HSL from surface-dark-card */;
    --card-foreground: 0 0% 100%;
    --popover: /* HSL from surface-dark-card */;
    --popover-foreground: 0 0% 100%;
    --muted: /* HSL from surface-dark-alt */;
    --muted-foreground: 0 0% 70%;
    --border: /* HSL from color-border-dark */;
    --input: /* HSL from color-border-dark */;
  }
}
```

---

## Registry Recommendations

### Core UI (@shadcn)
Default Shadcn components. Use for:
- Buttons, inputs, forms
- Dialogs, dropdowns, popovers
- Tabs, accordions, navigation

### Animated Icons (@lucide-animated)
367 animated SVG icons. Query examples:
```
icon arrow right animated
icon check circle animated
icon search magnifying glass
```

### Static Icons (@animate-ui)
518 icons with optional animation. Query examples:
```
icon bell notification
icon lock security
icon lightbulb idea
```

### Hero Components (@magicui)
High-impact visual components. Use for:
- Hero sections with animated backgrounds
- Particle effects, animated gradients
- Text reveal animations

### Premium Effects (@aceternity)
Advanced UI effects. Use for:
- 3D card effects
- Spotlight effects
- Animated backgrounds

### Motion Primitives (@motion-primitives)
Core animation building blocks. Use for:
- Staggered reveals
- Transition effects
- Scroll animations

---

## Component Query Patterns

### For Landing Page Sections

```markdown
# Hero
"hero section 2-column with headline and visual @shadcn"
"hero with animated background gradient @magicui"

# Features
"feature cards 3-column grid with icons @shadcn"
"bento grid feature showcase @magicui"

# Social Proof
"testimonial cards with avatar @shadcn"
"logo cloud grayscale @shadcn"

# CTA
"CTA banner dark background @shadcn"
"newsletter signup with input @shadcn"

# Icons (NEVER use emoji)
"icon [concept] @lucide-animated"
"icon [concept] @animate-ui"
```

### Query Modifiers

| Modifier | Effect |
|----------|--------|
| `@shadcn` | Core Shadcn components |
| `@magicui` | Animated hero components |
| `@aceternity` | Premium 3D effects |
| `animated` | Motion-enhanced variant |
| `dark` | Dark mode variant |

---

## Brand Override Snippets

### Card with Correct Radius

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Add className to apply brand radius and shadow
<Card className="rounded-[var(--radius-card)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
  <CardHeader>
    <CardTitle className="text-[hsl(var(--accent))] font-semibold">Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-[hsl(var(--muted-foreground))]">Description</p>
  </CardContent>
</Card>
```

### Badge with Correct Radius

```tsx
import { Badge } from "@/components/ui/badge"

<Badge className="rounded-[var(--radius-badge)] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] text-[7px] font-medium tracking-[var(--ls-wide)] uppercase">
  Label
</Badge>
```

### Button with Brand Colors

```tsx
import { Button } from "@/components/ui/button"

// Primary (dark)
<Button className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.9)]">
  Primary CTA
</Button>

// Secondary (accent)
<Button variant="secondary" className="bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/0.9)] text-white">
  Secondary CTA
</Button>

// Submit (coral/cta-submit)
<Button className="bg-[hsl(var(--cta-submit))] hover:bg-[hsl(var(--cta-submit)/0.9)] text-white">
  Submit
</Button>
```

### Accent Headline

```tsx
<h2 className="font-[var(--font-primary)] text-[38px] font-normal tracking-[var(--ls-headline)] leading-[42px]">
  <span className="text-[hsl(var(--accent-alt))]">Strategy</span>{" "}
  <span className="text-[hsl(var(--foreground))]">that drives growth</span>
</h2>
```

---

## Dark Band Section Pattern

When creating dark sections (like Stats Module):

```tsx
<section className="w-full bg-[hsl(var(--surface-dark))] py-20 px-[200px]">
  <div className="flex justify-between">
    {stats.map((stat, i) => (
      <div key={i} className="flex-1 text-center">
        <p className={cn(
          "font-[var(--font-primary)] text-[38px] font-normal tracking-[var(--ls-headline)]",
          i === 0 && "text-[hsl(var(--stat-1))]",
          i === 1 && "text-[hsl(var(--stat-2))]",
          i === 2 && "text-[hsl(var(--stat-3))]"
        )}>
          {stat.value}
        </p>
        <p className="font-[var(--font-primary)] text-[17px] font-normal tracking-[var(--ls-wide)] text-white mt-4">
          {stat.description}
        </p>
      </div>
    ))}
  </div>
</section>
```

---

## Blocks Compatibility

### Blocks That Work Out-of-Box
- Authentication forms (login, register)
- Dashboard layouts (with dark mode)
- Settings pages
- Data tables

### Blocks That Need Brand Adjustment
- Marketing hero sections → apply 2-column asymmetric layout
- Feature grids → apply `--radius-card`
- Pricing cards → apply brand colors
- Testimonial sections → apply accent tint background

### Blocks to Avoid or Heavily Modify
- Glass-morphism effects → use solid surfaces
- Purple gradient backgrounds → use brand gradients
- Generic icon grids → minimal icons, no emoji

---

## Checklist Before Using Shadcn Component

1. [ ] Does it need radius override? (cards: `--radius-card`, badges: `--radius-badge`, panels: `--radius-panel`)
2. [ ] Does it inherit correct brand colors from CSS variables?
3. [ ] Does it need shadow adjustment to match `--shadow-*` specs?
4. [ ] Does the typography use `--font-primary`/`--font-body` with correct letter-spacing?
5. [ ] If dark mode, does it use `--surface-dark` background?
6. [ ] No emoji icons - using @lucide-animated or @animate-ui?
