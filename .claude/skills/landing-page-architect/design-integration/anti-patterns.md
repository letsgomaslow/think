# Anti-Patterns Reference

Patterns to AVOID when recommending components and layouts. These signal "generic AI output" and lack design character.

> **Portability:** This file is already generic. Examples use CSS variables that inherit from `brand-config.md`.

## Layout Anti-Patterns

### Generic Centered Hero
**Problem:** Centered headline + two buttons is the default AI layout
**Instead:** Use asymmetric 2-column with visual element (code preview, diagram, floating cards)

```
❌ AVOID:
┌─────────────────────────────────┐
│         HEADLINE HERE          │
│        Subheadline text        │
│     [Button 1]  [Button 2]     │
└─────────────────────────────────┘

✅ USE:
┌─────────────────────────────────┐
│  HEADLINE          │           │
│  Subheadline       │  [Visual] │
│  [CTA]             │           │
└─────────────────────────────────┘
```

### 12-Column Centered Everything
**Problem:** Predictable, template-like
**Instead:** Use asymmetry, overlap, break grid intentionally

### Equal Spacing Everywhere
**Problem:** No visual hierarchy
**Instead:** Dramatic spacing differences (tight groupings, generous separation)

---

## Visual Effect Anti-Patterns

### Glass-Morphism Overuse
**Problem:** Overused since 2021, now signals "followed a tutorial"
**Instead:** Solid surfaces with subtle shadows, clear hierarchy

```css
/* ❌ AVOID */
.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* ✅ USE */
.card {
  background: var(--surface-card);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border);
}
```

### Fade-Up on Everything
**Problem:** Lazy animation choice, predictable
**Instead:** Staggered reveals on KEY elements only, purposeful motion

```css
/* ❌ AVOID - same animation on every element */
.card { animation: fadeUp 0.5s ease; }

/* ✅ USE - staggered on related items only */
.hero-eyebrow { animation-delay: 0.1s; }
.hero-title { animation-delay: 0.2s; }
.hero-cta { animation-delay: 0.4s; }
```

### Gradients on Backgrounds
**Problem:** Purple-to-blue gradients scream "AI generated"
**Instead:** Solid brand colors, or subtle single-hue gradients

```css
/* ❌ AVOID - classic AI slop */
background: linear-gradient(135deg, #a855f7, #8b5cf6);

/* ✅ USE - brand-aligned */
background: var(--surface-background);
background: var(--surface-dark);
/* Or use brand gradient from brand-config.md */
```

### Rounded Corners on Everything
**Problem:** Rounded-lg everywhere looks soft, uncommitted
**Instead:** Intentional radius choices, mix of sharp and rounded

---

## Border Radius Anti-Patterns (BRAND-CRITICAL)

### Using 8px for Cards
**Problem:** Generic 8px (0.5rem) is the Shadcn default, but likely NOT your brand
**Instead:** Use `--radius-card` from brand-config (typically 4px for professional look)

```css
/* ❌ AVOID - generic default */
.card { border-radius: 0.5rem; } /* 8px */
.card { border-radius: var(--radius); } /* if --radius is 8px */

/* ✅ USE - brand specification */
.card { border-radius: var(--radius-card); }
.badge { border-radius: var(--radius-badge); }
```

### Using Small Radius for Content Panels
**Problem:** Same radius on panels as cards looks cheap
**Instead:** Use `--radius-panel` for large content panels

```css
/* ❌ AVOID */
.content-panel { border-radius: 8px; }

/* ✅ USE - brand specification */
.content-panel { border-radius: var(--radius-panel); }
```

---

## Shadow Anti-Patterns (BRAND-CRITICAL)

### Generic Box Shadows
**Problem:** Arbitrary shadows lack consistency
**Instead:** Use exact shadow specifications from brand-config.md

```css
/* ❌ AVOID - arbitrary values */
.card { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
.card { box-shadow: 0 10px 25px rgba(0,0,0,0.15); }

/* ✅ USE - brand specs */
.card { box-shadow: var(--shadow-card); }
.card:hover { box-shadow: var(--shadow-card-hover); }
.banner { box-shadow: var(--shadow-marquee); }
```

### Missing Hover Shadow Intensification
**Problem:** No shadow change on hover feels flat
**Instead:** Shadow intensity increases on hover (brand-config defines ratio)

---

## Typography Anti-Patterns

### Default System Fonts
**Problem:** Inter, Arial, Roboto, system-ui lack character
**Instead:** Distinctive fonts from brand-config

```css
/* ❌ AVOID */
font-family: Inter, system-ui, sans-serif;
font-family: Arial, sans-serif;
font-family: Roboto, sans-serif;

/* ✅ USE */
font-family: var(--font-primary); /* headings */
font-family: var(--font-body);    /* body */
```

### Uniform Font Weights
**Problem:** All text same weight = no hierarchy
**Instead:** Dramatic weight contrast (200 vs 800)

### Small Text Everywhere
**Problem:** Timid, hard to read
**Instead:** Generous sizing, especially for headlines (48px+ for H1)

### Missing Letter Spacing
**Problem:** Default letter-spacing (0) on all text lacks refinement
**Instead:** Use contextual letter-spacing from design tokens

```css
/* ❌ AVOID - no letter-spacing consideration */
.headline { font-size: 60px; }
.label { font-size: 12px; }
.nav-logo { font-size: 14px; }

/* ✅ USE - semantic letter-spacing */
.headline {
  font-size: 60px;
  letter-spacing: var(--ls-tight); /* negative for large text */
}
.label {
  font-size: 12px;
  letter-spacing: var(--ls-wide); /* positive for labels */
}
.nav-logo {
  font-size: 14px;
  letter-spacing: var(--ls-wider); /* wider for logos */
  text-transform: uppercase;
}
.meta-label {
  font-size: 10px;
  letter-spacing: var(--ls-widest); /* widest for meta */
  text-transform: uppercase;
}
```

### Missing Meta Label Font
**Problem:** Using primary font for timestamps and category labels
**Instead:** Use `--font-meta` for meta labels

```css
/* ❌ AVOID */
.date { font-family: var(--font-primary); }

/* ✅ USE - semantic font role */
.date {
  font-family: var(--font-meta);
  font-size: 10px;
  letter-spacing: var(--ls-widest);
  text-transform: uppercase;
}
```

---

## Icon Anti-Patterns

### Heroicons on Every Card
**Problem:** Template-like, every AI app looks the same
**Instead:** Minimal icon usage, let content speak

### Colored Icon Backgrounds
**Problem:** Often arbitrary colors, visual noise
**Instead:** Monochrome icons with brand accent on hover

### Too Many Icons
**Problem:** Visual clutter, reduces impact
**Instead:** Icons for key differentiators only

### Emoji Icons (CRITICAL)
**Problem:** Unprofessional appearance, immediately signals AI-generated content ("AI Slop")
**Examples:** 👁️, 💡, 🔍, 📊, 🎯, ⚡, 🚀, ✨, 🧪, 📈, 🎲, 👓
**Instead:** Use Shadcn icon components from `@lucide-animated` or `@animate-ui` registries

```
❌ NEVER USE:
<span class="icon">🔍</span>
<div class="feature-icon">💡</div>

✅ USE:
Query: "icon search" in @lucide-animated
Query: "icon lightbulb" in @animate-ui
```

---

## Color Anti-Patterns

### Generic AI Purple
**Problem:** #a855f7, #8b5cf6, #7c3aed are overused
**Instead:** Brand-specific colors from brand-config

```css
/* ❌ AVOID - generic AI purple */
--primary: #a855f7;
--accent: #8b5cf6;

/* ✅ USE - brand colors */
--primary: var(--color-primary);
--accent: var(--color-accent);
```

### Rainbow Feature Cards
**Problem:** Different color for each card = visual chaos
**Instead:** Consistent palette, accent on interaction

### Arbitrary Dark Mode
**Problem:** Random dark colors, poor contrast
**Instead:** Use brand-defined dark tokens

```css
/* ❌ AVOID */
background: #1a1a1a;
background: #0f0f0f;

/* ✅ USE */
background: var(--surface-dark);
background: var(--surface-dark-card);
```

---

## Component Anti-Patterns

### Carousels for Everything
**Problem:** Users don't interact, hides content
**Instead:** Static grids, let user see all options

### Accordions for Short Content
**Problem:** Hides content that should be visible
**Instead:** Show content directly if it's brief

### Modal Overuse
**Problem:** Interrupts flow
**Instead:** Inline expansion, dedicated pages

### Infinite Scroll on Landing Pages
**Problem:** No sense of completion
**Instead:** Clear sections with defined end

---

## Animation Anti-Patterns

### Animation Without Purpose
**Problem:** Movement for movement's sake
**Instead:** Animation that aids understanding or draws attention

### Slow Transitions (>400ms)
**Problem:** Feels sluggish
**Instead:** Quick, snappy transitions (200-300ms)

### Animation on Scroll for Everything
**Problem:** Distracting, performative
**Instead:** Animate ONCE on initial viewport entry

---

## Copy Anti-Patterns

### Buzzword Headlines
**Problem:** "Leverage synergies", "Unlock potential"
**Instead:** Specific outcomes, action verbs

### Feature Lists Without Benefits
**Problem:** "Includes X" doesn't explain value
**Instead:** "X helps you Y"

### Too Many CTAs
**Problem:** Decision paralysis
**Instead:** One primary, one secondary max per section

---

## Quick Checklist

Before recommending a component, verify against these categories:

### Layout & Structure
- [ ] Not centered + two buttons (hero)
- [ ] Not using glass-morphism
- [ ] Not fade-up on every element

### Colors & Effects
- [ ] Not generic purple gradient (#a855f7/#8b5cf6)
- [ ] Colors from brand-config, not arbitrary
- [ ] Animation is purposeful, not decorative

### Typography
- [ ] Not using Inter/Arial/Roboto - use `--font-primary`/`--font-body`
- [ ] Using letter-spacing (`--ls-*` tokens)
- [ ] Using `--font-meta` for meta labels

### Icons
- [ ] Not Heroicons on every card
- [ ] **No emoji icons** - use @lucide-animated or @animate-ui only

### Border Radius (BRAND-CRITICAL)
- [ ] Cards using `--radius-card`, NOT 8px default
- [ ] Content panels using `--radius-panel`
- [ ] Badges using `--radius-badge`

### Shadows (BRAND-CRITICAL)
- [ ] Using `--shadow-card` from brand-config
- [ ] Hover: `--shadow-card-hover` (intensified)
- [ ] Banners: `--shadow-marquee`
