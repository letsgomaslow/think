# Design Tokens

Semantic token architecture for brand-aligned component recommendations. This file defines token CATEGORIES and ROLES - actual values come from `brand-config.md`.

> **Portability:** This file defines structure, not values. Never edit this when copying to a new project.

---

## Token Architecture

```
┌─────────────────────────────────────────────────────────┐
│  brand-config.md (Project-Specific Values)              │
│  - Actual hex codes, font names, pixel values           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  design-tokens.md (THIS FILE - Generic Structure)       │
│  - Token categories and semantic roles                  │
│  - CSS variable naming conventions                      │
│  - Usage guidelines and constraints                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  Component Patterns / Shadcn Integration                │
│  - Reference tokens by semantic name                    │
│  - var(--color-primary), var(--radius-card), etc.      │
└─────────────────────────────────────────────────────────┘
```

---

## BRAND-CRITICAL vs BRAND-FLEXIBLE

### BRAND-CRITICAL (Never Deviate)
These token categories require exact values from brand-config.md. Do not approximate.

| Category | Tokens | Why Critical |
|----------|--------|--------------|
| **Card Radius** | `--radius-card` | Visual identity differentiator |
| **Panel Radius** | `--radius-panel` | Large surface treatment |
| **Badge Radius** | `--radius-badge` | Consistent micro-elements |
| **Primary Colors** | `--color-primary`, `--color-accent` | Brand recognition |
| **Card Shadows** | `--shadow-card`, `--shadow-card-hover` | Depth language |
| **Primary Fonts** | `--font-primary`, `--font-body` | Typography voice |
| **Hover Behavior** | Expand + shadow intensification | Interaction signature |

### BRAND-FLEXIBLE (Can Extend)
These patterns can be extended while maintaining visual language.

| Category | Base Pattern | Extensions Allowed |
|----------|--------------|-------------------|
| **Statistics Colors** | 3 accent colors | Additional data viz colors |
| **Spacing** | Base unit scale | Custom multiples for layouts |
| **Animation Timing** | 200-300ms | Context-appropriate durations |
| **Dark Mode** | Core surfaces | Additional dark variants |

---

## Color Token Categories

### Primary Colors
Core brand colors used for primary UI elements.

| Token | Role | Use |
|-------|------|-----|
| `--color-primary` | Main action | Primary CTAs, links, focus states |
| `--color-secondary` | Supporting action | Secondary buttons, dark CTAs |
| `--color-accent` | Highlight | Badges, selected states, emphasis |
| `--color-accent-alt` | Alternative accent | Service categories, variations |

### CTA Colors
Specific colors for call-to-action elements.

| Token | Role | Use |
|-------|------|-----|
| `--color-cta` | Link text | READ MORE, VIEW ALL links |
| `--color-cta-submit` | Form submit | Submit buttons specifically |

### Statistics/Data Colors
For data visualization and statistics displays.

| Token | Role | Use |
|-------|------|-----|
| `--color-stat-1` | First stat | Primary statistic |
| `--color-stat-2` | Second stat | Secondary statistic |
| `--color-stat-3` | Third stat | Tertiary statistic |

### Neutral Colors
Text and border colors.

| Token | Role | Use |
|-------|------|-----|
| `--color-foreground` | Primary text | Headlines, body text |
| `--color-muted` | Secondary text | Captions, placeholders |
| `--color-border` | Borders | Input borders, dividers |
| `--color-divider` | Dividers | Section separators |

---

## Surface Token Categories

### Light Mode Surfaces

| Token | Role | Use |
|-------|------|-----|
| `--surface-background` | Page background | Main page bg |
| `--surface-card` | Card surface | Cards, modals |
| `--surface-muted` | Muted surface | Alt sections, panels |

### Dark Mode Surfaces

| Token | Role | Use |
|-------|------|-----|
| `--surface-dark` | Dark background | Dark band sections |
| `--surface-dark-card` | Card on dark | Cards in dark sections |
| `--surface-dark-alt` | Alt dark surface | Variations on dark |

---

## Typography Token Categories

### Font Families

| Token | Role | Use |
|-------|------|-----|
| `--font-primary` | Headings, UI | H1-H6, navigation, buttons, meta labels |
| `--font-body` | Body copy | Paragraphs, descriptions |
| `--font-editorial` | Editorial display | Article headlines, pull quotes |
| `--font-code` | Code | Code blocks, terminal |

### Font Weights

| Token | Value | Use |
|-------|-------|-----|
| `--weight-normal` | 400 | Body text |
| `--weight-medium` | 500 | Captions, labels |
| `--weight-semibold` | 600 | Card titles |
| `--weight-bold` | 700 | Section headers |
| `--weight-extrabold` | 800 | Hero headlines |

### Letter Spacing

| Token | Role | Use |
|-------|------|-----|
| `--ls-tight` | Negative tracking | Large headlines (48px+) |
| `--ls-headline` | Slight negative | Subheadings |
| `--ls-normal` | Zero | Body text |
| `--ls-wide` | Positive tracking | Labels, captions |
| `--ls-wider` | Wide tracking | Navigation, logos |
| `--ls-widest` | Extra wide | Meta labels, tags |

---

## Spacing Token Categories

| Token | Multiple | Use |
|-------|----------|-----|
| `--space-1` | 1x base | Minimal gaps |
| `--space-2` | 2x base | Tight spacing |
| `--space-4` | 4x base | Standard spacing |
| `--space-6` | 6x base | Comfortable spacing |
| `--space-8` | 8x base | Section gaps |
| `--space-12` | 12x base | Large separation |
| `--space-16` | 16x base | Section padding |
| `--space-24` | 24x base | Hero padding |

> **Common Base:** 4px (tokens become 4, 8, 16, 24, 32, 48, 64, 96)

---

## Border Radius Token Categories

Two distinct scales - do not mix.

### Precise Scale (UI Elements)

| Token | Role | Use |
|-------|------|-----|
| `--radius-badge` | Smallest | Badges, status dots |
| `--radius-card` | Standard | Cards, buttons, inputs |

### Soft Scale (Content Panels)

| Token | Role | Use |
|-------|------|-----|
| `--radius-panel` | Large | Content panels, modules |

> **CRITICAL:** Cards use precise scale, content panels use soft scale. Never use 8px as a compromise.

---

## Shadow Token Categories

| Token | Role | Use |
|-------|------|-----|
| `--shadow-card` | Default | Card resting state |
| `--shadow-card-hover` | Hover | Card hover (2-3x intensity) |
| `--shadow-marquee` | Banner | Hero sections with depth |
| `--shadow-elevated` | Elevated | Modals, dropdowns |
| `--shadow-mockup` | Device | Phone/device mockups |

### Shadow Intensification Pattern
Hover states should increase shadow intensity, not spread.

```css
/* CORRECT: Increase intensity */
.card { box-shadow: var(--shadow-card); }
.card:hover { box-shadow: var(--shadow-card-hover); }

/* AVOID: Arbitrary changes */
.card:hover { box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
```

---

## CSS Variable Implementation

### Shadcn-Compatible Variables

Map semantic tokens to Shadcn's expected CSS variables:

```css
:root {
  /* Core Shadcn Variables */
  --background: /* from surface-background */;
  --foreground: /* from color-foreground */;
  --card: /* from surface-card */;
  --card-foreground: /* from color-foreground */;
  --popover: /* from surface-card */;
  --popover-foreground: /* from color-foreground */;
  --primary: /* from color-secondary (dark CTA) */;
  --primary-foreground: /* white */;
  --secondary: /* from color-primary (teal/accent) */;
  --secondary-foreground: /* white */;
  --muted: /* from surface-muted */;
  --muted-foreground: /* from color-muted */;
  --accent: /* from color-accent */;
  --accent-foreground: /* from color-foreground */;
  --destructive: /* red error color */;
  --destructive-foreground: /* white */;
  --border: /* from color-border */;
  --input: /* from color-border */;
  --ring: /* from color-primary (focus color) */;
  --radius: /* from radius-card */;

  /* Extended Brand Variables */
  --stat-1: /* from color-stat-1 */;
  --stat-2: /* from color-stat-2 */;
  --stat-3: /* from color-stat-3 */;
  --cta: /* from color-cta */;
  --cta-submit: /* from color-cta-submit */;

  /* Shadows */
  --shadow-card: /* from brand-config */;
  --shadow-card-hover: /* from brand-config */;
  --shadow-elevated: /* from brand-config */;

  /* Radii */
  --radius-badge: /* from brand-config */;
  --radius-card: /* from brand-config */;
  --radius-panel: /* from brand-config */;
}

.dark {
  --background: /* from surface-dark */;
  --foreground: /* white */;
  --card: /* from surface-dark-card */;
  --card-foreground: /* white */;
  /* ... other dark mode overrides */
}
```

---

## Usage Guidelines

### When Recommending Components

1. **Reference tokens by role, not value:**
   ```css
   /* CORRECT */
   background: var(--color-primary);
   border-radius: var(--radius-card);

   /* AVOID */
   background: #6DC4AD;
   border-radius: 4px;
   ```

2. **Use BRAND-CRITICAL tokens exactly:**
   - Card radius must match `--radius-card`
   - Shadows must match `--shadow-card` / `--shadow-card-hover`
   - Primary font must be `--font-primary`

3. **Extend BRAND-FLEXIBLE tokens thoughtfully:**
   - Additional spacing values should follow the scale
   - New colors should complement existing palette
   - Animation timing should stay within 200-400ms

### Signature Patterns

These interaction patterns should be consistent across all projects:

| Pattern | Behavior |
|---------|----------|
| **Card Hover** | Shadow intensifies (2-3x), optional height expand |
| **Focus State** | Ring using `--color-primary` |
| **Selection** | Background tint + left border accent |
| **Link Hover** | Underline or color shift |

---

## Quick Reference

### For Component Recommendations

| Need | Token |
|------|-------|
| Primary button bg | `--color-secondary` (dark) |
| Secondary button bg | `--color-primary` (accent) |
| Card background | `--surface-card` |
| Card border radius | `--radius-card` |
| Card shadow | `--shadow-card` |
| Focus ring | `--color-primary` |
| Page background | `--surface-background` |
| Dark section bg | `--surface-dark` |
| Body text | `--color-foreground` |
| Muted text | `--color-muted` |
| Heading font | `--font-primary` |
| Body font | `--font-body` |
| Editorial font | `--font-editorial` |

### Token Naming Convention

Format: `--{category}-{role}`

| Category | Examples |
|----------|----------|
| `color-*` | `--color-primary`, `--color-accent` |
| `surface-*` | `--surface-card`, `--surface-dark` |
| `radius-*` | `--radius-card`, `--radius-panel` |
| `shadow-*` | `--shadow-card`, `--shadow-elevated` |
| `font-*` | `--font-primary`, `--font-editorial`, `--font-code` |
| `space-*` | `--space-4`, `--space-8` |
| `ls-*` | `--ls-tight`, `--ls-wide` |
