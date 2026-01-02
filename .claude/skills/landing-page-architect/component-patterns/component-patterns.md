# Component Patterns

Semantic Shadcn component queries and CSS templates for landing page sections. Use these patterns when recommending components.

> **Portability:** This file defines generic archetypes. CSS templates use CSS variables that inherit values from `brand-config.md`.

---

## Component Archetype Reference

| Archetype | Description | CSS Class |
|-----------|-------------|-----------|
| **Feature Card** | Portfolio/case study card with hover expand | `.feature-card` |
| **Stats Module** | Dark band with statistics | `.stats-module` |
| **Status Badge** | Small indicator with dot | `.status-badge` |
| **Accent Headline** | First word in accent color | `.accent-headline` |
| **Content Panel** | Large rounded panel | `.content-panel` |
| **List Item** | News/blog list row | `.list-item` |
| **Hero Banner** | Full-width hero with shadow | `.hero-banner` |
| **Link Text** | VIEW ALL / READ MORE style | `.link-text` |

---

## Hero Sections

### Standard 2-Column Hero
**Use when:** Product has visual element (code preview, diagram, screenshot)
```
hero section 2-column grid with headline left and visual right
hero asymmetric layout with CTA and product preview
```
**Brand alignment:**
- Grid: 55% content / 45% visual
- Accent line above eyebrow
- Staggered animation (eyebrow → title → CTA)

### Minimal Hero
**Use when:** Message is strong enough alone
```
hero minimal centered with single CTA
hero with large typography and subtle background
```
**Brand alignment:**
- Max-width 800px for readability
- Extra padding (160px+ top)

### Hero with Form
**Use when:** Lead capture is primary goal
```
hero with email input and submit button
hero split with form card on right
```
**Brand alignment:**
- Input: Ghost style with border
- Submit: Use `--color-cta-submit`

---

## Feature Sections

### 3-Column Feature Cards
**Use when:** 3 key benefits to highlight
```
feature cards 3-column grid with icons
feature blocks with heading description and icon
```
**Brand alignment:**
- Gap: `--space-8`
- Hover: translateY(-4px) + left border reveal
- Icons: Minimal, monochrome

### Bento Grid
**Use when:** Features have different weights
```
bento grid layout 2x3 with mixed card sizes
feature grid with hero card and supporting cards
```
**Brand alignment:**
- Large card: 2x width for main feature
- Consistent `--radius-card`

### Stats Section
**Use when:** Proof through numbers
```
stats section with large numbers and labels
metrics display 4-column with icons
```
**Brand alignment:**
- Numbers: `--font-primary` weight 800, 48px+
- Labels: `--font-body` weight 500, muted color

---

## Social Proof Sections

### Testimonial Cards
**Use when:** Customer quotes available
```
testimonial cards with avatar and quote
customer review grid 3-column
quote blocks with attribution
```
**Brand alignment:**
- Quote mark: `--color-primary`, large (48px)
- Background: Primary tint at 10% opacity
- No carousel (static display)

### Logo Cloud
**Use when:** Brand recognition matters
```
logo cloud grayscale with color on hover
client logos horizontal scroll
partner logos 6-column grid
```
**Brand alignment:**
- Grayscale default, color on hover
- Consistent logo heights (32-48px)

---

## Process/Plan Sections

### Numbered Steps
**Use when:** Process is sequential
```
steps section with numbered cards horizontal
process flow 3-step with icons and descriptions
```
**Brand alignment:**
- Numbers: `--font-primary` weight 800, large
- Connector: Subtle line or arrow
- Max 3 steps

### Timeline
**Use when:** Progression matters
```
timeline vertical with icons and content
process timeline with milestones
```
**Brand alignment:**
- Line: 2px, `--color-muted`
- Nodes: `--color-primary`

---

## Demo/Preview Sections

### Code Preview
**Use when:** Developer audience
```
code block with syntax highlighting
terminal window with command output
split view code input and output
```
**Brand alignment:**
- Font: `--font-code`
- Background: `--surface-dark`
- Syntax: Brand colors for highlights

### Interactive Demo
**Use when:** Tool can be demonstrated
```
demo panel with input and output areas
interactive preview with tabbed examples
before after comparison slider
```
**Brand alignment:**
- Panel background: `--surface-dark-card`
- Headers: `--surface-dark-alt`

---

## CTA Sections

### CTA Banner
**Use when:** Strong final push
```
CTA banner full-width with heading and button
call to action section with background
```
**Brand alignment:**
- Background: `--surface-dark`
- Text: White
- Button: `--color-primary`

### Newsletter Signup
**Use when:** Building email list
```
newsletter section with input and submit
email capture with heading and description
```
**Brand alignment:**
- Input: White/transparent with border
- Submit: `--color-cta-submit`

---

## Comparison Sections

### Before/After
**Use when:** Transformation is key message
```
before after comparison two columns
transformation section with contrast
```
**Brand alignment:**
- Before: Muted styling
- After: Full brand treatment

### Pricing Cards
**Use when:** Multiple tiers
```
pricing cards 3-column with features
plan comparison table with highlights
```
**Brand alignment:**
- Highlighted tier: `--color-primary` border
- CTA: Primary style for main tier

---

## Dark Band Section

**When to use:** Create emphasis within light pages

```
dark section with heading and demo
feature showcase on dark background
testimonials on dark band
```

**Brand alignment:**
- Background: `--surface-dark`
- Surface: `--surface-dark-card`
- Text: White
- Accent: `--color-primary` pops on dark

---

## Footer

```
footer with navigation and newsletter
footer minimal with links and copyright
footer 4-column with sections
```

**Brand alignment:**
- Background: `--surface-dark` or `--surface-card`
- Links: `--color-muted`, `--color-primary` on hover
- Newsletter: Include transitional CTA

---

## Icon Components

**CRITICAL: NEVER use emoji icons.** Emojis signal AI-generated content.

### @lucide-animated (367 icons)
**Use when:** Need animated icons for interactive elements
```
icon arrow right animated
icon check circle animated
icon alert triangle animated
icon search magnifying glass
icon chart bar analytics
```

### @animate-ui (518 icons)
**Use when:** Need static or subtly animated icons
```
icon bell notification
icon lock security
icon menu hamburger
icon lightbulb idea
icon target goal
icon flask experiment
```

### Icon Usage Guidelines
- Query registry with semantic description: `icon [concept]`
- Prefer minimal, monochrome icons
- Icons should complement, not dominate content
- Use consistent icon style within a page

**Brand alignment:**
- Color: `--color-primary` or `--color-muted`
- Size: 24px for inline, 32-48px for feature cards
- Hover: Brand accent reveal

---

## Query Templates by Page Section

### Complete Landing Page Flow

```markdown
1. Hero: "hero 2-column with headline CTA and visual preview"
2. Stakes: "problem section with 3 pain point cards icons"
3. Features: "feature cards 3-column with hover effects"
4. Process: "steps section numbered 3 horizontal"
5. Demo: "demo panel dark background with code preview"
6. Social Proof: "testimonial cards with quotes avatars"
7. CTA: "CTA banner dark with heading and button"
8. Footer: "footer 4-column with newsletter signup"
```

---

## Query Modifiers

Add these to refine component searches:

| Modifier | Effect |
|----------|--------|
| `dark` | Dark background variant |
| `minimal` | Simplified styling |
| `with icons` | Icon-enhanced |
| `animated` | Motion effects |
| `responsive` | Mobile-first |
| `glassmorphism` | ❌ AVOID |
| `gradient` | ❌ CHECK against brand |

---

## CSS Component Templates

These templates use CSS variables for brand portability. Copy directly.

### Feature Card

Portfolio/case study card with hover expansion.

```css
.feature-card {
  width: 390px;
  background: var(--surface-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Hover: Shadow intensifies (BRAND-CRITICAL pattern) */
.feature-card:hover {
  box-shadow: var(--shadow-card-hover);
}

/* Image Area */
.feature-card-image {
  width: 100%;
  height: 280px;
  object-fit: cover;
}

/* Content Area */
.feature-card-content {
  padding: var(--space-6);
}

/* Title */
.feature-card-title {
  font-family: var(--font-primary);
  font-size: 21px;
  font-weight: 600;
  color: var(--color-accent);
  margin-bottom: var(--space-2);
}

/* Description */
.feature-card-description {
  font-family: var(--font-primary);
  font-size: 17px;
  font-weight: 400;
  color: var(--color-muted);
  line-height: 21px;
}

/* CTA (reveals on hover) */
.feature-card-cta {
  font-family: var(--font-primary);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: var(--ls-wider);
  color: var(--color-cta);
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.feature-card:hover .feature-card-cta {
  opacity: 1;
  transform: translateY(0);
}
```

---

### Status Badge

Small indicator with colored dot.

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface-background);
  border-radius: var(--radius-badge);
  padding: 0 6px;
  height: 16px;
}

.status-badge-text {
  font-family: var(--font-primary);
  font-size: 7px;
  font-weight: 500;
  letter-spacing: var(--ls-wide);
  color: var(--color-foreground);
  text-transform: uppercase;
}

.status-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-badge-dot--active { background: #2CD552; }
.status-badge-dot--inactive { background: #D52C2C; }
```

---

### Stats Module

Dark band with statistics display.

```css
.stats-module {
  width: 100%;
  background: var(--surface-dark);
  padding: 83px 200px;
  display: flex;
  justify-content: space-between;
}

.stats-module-divider {
  width: 1px;
  background: rgba(151, 151, 151, 0.3);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  font-family: var(--font-primary);
  font-size: 38px;
  font-weight: 400;
  letter-spacing: var(--ls-headline);
  line-height: 42px;
}

/* Statistics accent colors - use brand stat tokens */
.stat-number--1 { color: var(--color-stat-1); }
.stat-number--2 { color: var(--color-stat-2); }
.stat-number--3 { color: var(--color-stat-3); }

.stat-description {
  font-family: var(--font-primary);
  font-size: 17px;
  font-weight: 400;
  letter-spacing: var(--ls-wide);
  line-height: 27px;
  color: #FFFFFF;
  margin-top: var(--space-4);
}
```

---

### Accent Headline

First word in accent color, rest in dark.

```css
.accent-headline {
  font-family: var(--font-primary);
  font-size: 38px;
  font-weight: 400;
  letter-spacing: var(--ls-headline);
  line-height: 42px;
}

.accent-headline .accent {
  color: var(--color-accent-alt);
}

.accent-headline .dark {
  color: var(--color-foreground);
}
```

**HTML Usage:**
```html
<h2 class="accent-headline">
  <span class="accent">Strategy</span>
  <span class="dark">that drives growth</span>
</h2>
```

---

### Content Panel

Large rounded panel for content modules.

```css
.content-panel {
  width: 600px;
  background: var(--surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  padding: var(--space-12);
}

.content-panel-headline {
  font-family: var(--font-primary);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: var(--ls-headline);
  color: var(--color-foreground);
  margin-bottom: var(--space-6);
}

/* Accent divider line above */
.content-panel::before {
  content: '';
  display: block;
  width: 60px;
  height: 1px;
  background: var(--color-accent-alt);
  margin-bottom: var(--space-6);
}

/* Bullet list with accent dots */
.content-panel ul li {
  font-family: var(--font-primary);
  font-size: 15px;
  font-weight: 400;
  color: var(--color-muted);
  margin-bottom: var(--space-4);
  padding-left: 20px;
  position: relative;
}

.content-panel ul li::before {
  content: '•';
  color: var(--color-stat-1);
  position: absolute;
  left: 0;
}
```

---

### List Item

News/blog list row with date and link.

```css
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 57px;
  border-bottom: 1px solid var(--color-divider);
  padding: 0 var(--space-4);
}

.list-item-date {
  font-family: var(--font-primary);
  font-size: 9px;
  font-weight: 400;
  letter-spacing: var(--ls-wider);
  color: var(--color-foreground);
  text-transform: uppercase;
  width: 100px;
}

.list-item-title {
  font-family: var(--font-primary);
  font-size: 15px;
  font-weight: 400;
  color: var(--color-foreground);
  flex: 1;
}

.list-item-link {
  font-family: var(--font-primary);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: var(--ls-wider);
  color: var(--color-cta);
  text-transform: uppercase;
  text-decoration: none;
}

.list-item-link:hover {
  text-decoration: underline;
}
```

---

### Hero Banner

Full-width hero section with shadow.

```css
.hero-banner {
  width: 100%;
  height: 560px;
  background: var(--surface-card);
  box-shadow: var(--shadow-marquee);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 200px;
}

.hero-banner-headline {
  font-family: var(--font-primary);
  font-size: 60px;
  font-weight: 600;
  letter-spacing: var(--ls-tight);
  line-height: 62px;
  color: var(--color-foreground);
}

.hero-banner-secondary {
  font-family: var(--font-primary);
  font-size: 60px;
  font-weight: 400;
  letter-spacing: var(--ls-tight);
  line-height: 62px;
  color: var(--color-muted);
}
```

---

### Link Text

VIEW ALL / READ MORE style links.

```css
.link-text {
  font-family: var(--font-primary);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: var(--ls-wider);
  line-height: 13px;
  text-transform: uppercase;
  text-decoration: none;
}

.link-text--accent {
  color: var(--color-cta);
}

.link-text--dark {
  color: var(--color-foreground);
}

.link-text::after {
  content: ' >';
  margin-left: 4px;
}
```
