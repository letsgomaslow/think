---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when building web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

# Frontend Design Skill

## Design Thinking Framework

Before coding, answer these questions:
1. **Purpose**: What problem does this solve and for whom?
2. **Tone**: Choose a clear aesthetic direction (brutalism, maximalism, retro-futuristic, minimal, bold)
3. **Constraints**: Technical requirements and platform limitations
4. **Differentiation**: What makes this design unforgettable?

## Typography

**NEVER use:**
- Inter, Arial, Roboto, system-ui, sans-serif defaults
- These are "AI slop" - generic choices that lack character

**DO use distinctive fonts from Google Fonts:**
- Display: Bricolage Grotesque, Cabinet Grotesk, Space Grotesk, Playfair Display, **Manrope**
- Body: Plus Jakarta Sans, Outfit, Graphik (licensed), Manrope
- Code: JetBrains Mono, Fira Code

> **Maslow AI Projects**: Use Manrope for headings and Graphik for body text per `maslow-brand` skill.

**Implementation:**
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

## Color System

**AVOID:**
- Purple gradients on white backgrounds (#a855f7, #8b5cf6 - classic AI slop)
- Default Tailwind colors without customization
- Evenly distributed, timid color palettes

**DO:**
- Use CSS custom properties for all colors
- Choose dominant colors with sharp accents
- Draw from: IDE themes, cultural aesthetics, nature, architecture

```css
:root {
  --color-primary: #f59e0b;
  --color-secondary: #14b8a6;
  --color-accent: #f43f5e;
  --color-surface: #18181b;
  --color-text: #fafafa;
}
```

> **Maslow AI Projects**: Use brand palette from `maslow-brand` skill:
> - Primary CTA: Teal `#6DC4AD`
> - Hero/Premium: Purple `#401877` (NOT generic AI purple)
> - Service colors: Pink `#EE7BB3` (Strategy), Teal (Tech), Purple Light `#A070A6` (Design)

## Motion & Animation

**Principles:**
- CSS-only for HTML; Motion library for React
- Focus on high-impact moments: page-load reveals, scroll triggers, hover states
- Staggered animations with `animation-delay` create polish

**ALWAYS include reduced motion support:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Spatial Composition

- Use asymmetry, overlap, diagonal flow
- Break grid expectations intentionally
- Balance generous negative space OR controlled density
- Avoid predictable 12-column centered layouts

## Visual Details

- Create atmosphere: layered gradients, subtle textures, noise overlays
- Apply dramatic shadows for depth
- Consider decorative borders, custom cursors, grain effects

## What to NEVER Do

- Glass-morphism on everything (overused)
- Fade-up animations on all elements (lazy)
- Purple/blue gradients (screams "AI generated")
- Default rounded corners (rounded-lg everywhere)
- Generic hero sections with centered text + two buttons
- Icon-heavy designs with Heroicons on every card

---

## Brand Integration

**For Maslow AI projects**, this skill works alongside:

| Skill | Role |
|-------|------|
| `maslow-brand` | Specific color tokens, typography, interaction patterns |
| `accessibility-design` | WCAG compliance, contrast ratios, focus states |

**Workflow**: Apply this skill's aesthetic principles → Use `maslow-brand` tokens → Verify with `accessibility-design` checklist.
