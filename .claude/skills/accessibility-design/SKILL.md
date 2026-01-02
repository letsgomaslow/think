---
name: accessibility-design
description: Ensure WCAG 2.1 AA compliance in all frontend designs. Use this skill when building any user interface to guarantee visibility, contrast, keyboard navigation, and screen reader support.
---

# Accessibility Design Skill

## Color Contrast Requirements (WCAG AA)

| Element Type | Minimum Ratio | Example |
|--------------|---------------|---------|
| Normal text (<18px) | 4.5:1 | Dark gray #374151 on white |
| Large text (18px+ or 14px bold) | 3:1 | Medium gray #6b7280 on white |
| UI components & graphics | 3:1 | Borders, icons, focus rings |

**Testing:** Use browser DevTools or webaim.org/resources/contrastchecker

**Safe Dark Mode Combinations:**
- Text on dark: Use #e5e7eb (gray-200) minimum, #f9fafb (gray-50) preferred
- NEVER use: #9ca3af (gray-400) or darker for body text on dark backgrounds

> **Maslow AI**: Use `#FFFFFF` on Dark Blue `#121D35` and Purple `#401877`. Use `#333333` on Teal `#6DC4AD`, Pink `#EE7BB3`, and Orange `#F3A326`. See `maslow-brand` skill for full contrast table.

## Focus States

**Required for ALL interactive elements:**
```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Never do this without replacement */
/* :focus { outline: none; } ← WRONG */
```

> **Maslow AI**: Use Teal `#6DC4AD` for focus rings (`--state-focus-ring` in `maslow-brand`).

**Tab order must be:**
- Logical (follows visual flow)
- Complete (all interactive elements reachable)
- Indicated (visible focus ring)

## Semantic HTML Structure

**Required landmarks:**
```html
<header role="banner">
  <nav role="navigation" aria-label="Main">
<main role="main">
<aside role="complementary">
<footer role="contentinfo">
```

**Heading hierarchy:**
- One `<h1>` per page
- Sequential: h1 → h2 → h3 (no skipping)
- Descriptive, not generic ("Features" not "Section 2")

## ARIA Labels

**Interactive elements need labels:**
```html
<!-- Icon-only buttons -->
<button aria-label="Close menu">
  <svg>...</svg>
</button>

<!-- Links with non-descriptive text -->
<a href="/docs" aria-label="Read the documentation">Learn more</a>

<!-- Form inputs -->
<input type="email" aria-label="Email address" placeholder="you@example.com">
```

## Motion Safety

**Always include:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Animation rules:**
- No auto-playing animations longer than 5 seconds
- Provide pause/stop controls for persistent motion
- Avoid flashing content (max 3 flashes/second)

## Images & Icons

**All images need alt text:**
```html
<!-- Informative -->
<img src="chart.png" alt="Sales increased 40% in Q4 2024">

<!-- Decorative (hide from screen readers) -->
<img src="decoration.svg" alt="" role="presentation">

<!-- SVG icons -->
<svg aria-hidden="true">...</svg>
<span class="sr-only">Menu</span>
```

## Screen Reader Utilities

**Include in CSS:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Checklist Before Shipping

- [ ] All text meets contrast requirements
- [ ] Focus indicators visible on all interactive elements
- [ ] Keyboard navigation works (Tab, Enter, Escape, Arrows)
- [ ] Heading hierarchy is sequential
- [ ] Images have alt text
- [ ] ARIA labels on icon-only buttons
- [ ] Reduced motion media query included
- [ ] No content relies solely on color to convey meaning

---

## Brand Integration

**For Maslow AI projects**, reference the `maslow-brand` skill for:

| Element | Maslow Token |
|---------|--------------|
| Focus ring | `--state-focus-ring: #6DC4AD` |
| Dark background | `--dark-background: #121D35` |
| Text on dark | `--dark-text-primary: #FFFFFF` |
| Text on light | `--light-text-primary: #333333` |

**Verified Contrast Pairs** (from `maslow-brand`):
- ✅ White `#FFFFFF` on Purple `#401877` — 10.5:1
- ✅ White `#FFFFFF` on Dark Blue `#121D35` — 15.2:1
- ✅ Dark `#333333` on Teal `#6DC4AD` — 4.8:1
- ✅ Dark `#333333` on Pink `#EE7BB3` — 4.5:1
