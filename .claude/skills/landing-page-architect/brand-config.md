# Brand Configuration

Project-specific values for the design system. Edit this file when adapting the skill to a new project.

> **Note:** This is the ONLY file you need to modify when copying this skill to a new project. All other skill files reference these values via semantic token names.

---

## Brand Identity

| Property | Value |
|----------|-------|
| **Brand Name** | Maslow AI |
| **Design Source** | Zeplin UI Standards |
| **Last Updated** | 2025-12-29 |

---

## Required Values

### Primary Colors

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `color-primary` | #6DC4AD | 159 43% 60% | Main CTA, technology services |
| `color-secondary` | #333333 | 0 0% 20% | Secondary buttons, dark CTA |
| `color-accent` | #EE7BB3 | 330 72% 70% | Highlights, strategy services |
| `color-accent-alt` | #A070A6 | 292 24% 55% | Design services, two-tone headlines |
| `color-purple` | #401877 | 263 66% 28% | Brand hero, premium contexts |

### CTA Colors

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `color-cta-pink` | #DA85B2 | 330 52% 68% | VIEW CASE STUDY, READ MORE links |
| `color-cta-coral` | #E19379 | 17 67% 68% | Form submit buttons |

### Statistics Accents

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `color-stat-teal` | #73C1AE | 161 40% 60% | Statistics, bullet dots |
| `color-stat-orange` | #EBA93D | 36 82% 58% | Statistics accent |
| `color-stat-purple` | #A070A6 | 292 24% 55% | Statistics accent |

### Neutral Colors

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `color-foreground` | #333333 | 0 0% 20% | Primary text |
| `color-muted` | #A5A5A5 | 0 0% 65% | Secondary text |
| `color-near-black` | #1B1F24 | 216 22% 12% | Headlines, emphasis |

### Surface Colors (Light Mode)

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `surface-background` | #E6EAF3 | 230 25% 95% | Page background |
| `surface-card` | #FFFFFF | 0 0% 100% | Card backgrounds |
| `surface-muted` | #FAFAFA | 0 0% 98% | Content panels |

### Surface Colors (Dark Mode)

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `surface-dark` | #121D35 | 220 45% 14% | Dark band background |
| `surface-dark-card` | #1A2847 | 220 35% 21% | Cards on dark |
| `surface-dark-alt` | #243356 | 220 35% 28% | Alternate on dark |

### Border Colors

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `color-border` | #D0D5E0 | 220 14% 85% | Default borders |
| `color-border-light` | #F1F1F1 | 0 0% 95% | Card borders |
| `color-divider` | #E1E1E1 | 0 0% 88% | Section dividers |
| `color-divider-accent` | #A070A6 | 292 24% 55% | Accent dividers |

---

## Typography

### Font Families

| Role | Font Family | Fallback | Use |
|------|-------------|----------|-----|
| `font-primary` | Manrope | system-ui, sans-serif | Headings, navigation, buttons, meta labels |
| `font-body` | Graphik | system-ui, sans-serif | Body copy, paragraphs |
| `font-editorial` | Nocturno Display | Georgia, serif | Article headlines, pull quotes |
| `font-code` | JetBrains Mono | monospace | Code blocks, terminal |

### Font Weights

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 Hero | font-primary | 800 | 48px+ |
| H2 Section | font-primary | 700 | 36px |
| H3 Card | font-primary | 600 | 24px |
| Body | font-body | 400 | 16px |
| Caption | font-body | 500 | 14px |

### Letter Spacing

| Token | Value | Use |
|-------|-------|-----|
| `ls-tight` | -1.4px | Headlines (60px+) |
| `ls-headline` | -0.89px | Subheadings (38px) |
| `ls-normal` | 0 | Body text |
| `ls-wide` | 0.4px | Labels, captions |
| `ls-wider` | 2px | Logos, navigation, badges |
| `ls-widest` | 4px | Meta labels |

---

## Spacing

| Token | Value |
|-------|-------|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-24` | 96px |

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-badge` | 2px | Badges, status indicators |
| `radius-card` | 4px | Cards, buttons, inputs |
| `radius-panel` | 34px | Content panels, modules |

> **CRITICAL:** Cards use 4px (NOT 8px). Content panels use 34px.

---

## Shadows

| Token | Value | Use |
|-------|-------|-----|
| `shadow-card` | 0 0 4px rgba(0,0,0,0.06) | Default card |
| `shadow-card-hover` | 0 0 4px rgba(0,0,0,0.19) | Card hover (3x intensity) |
| `shadow-marquee` | 0 2px 10px rgba(0,0,0,0.1) | Hero banners |
| `shadow-elevated` | 0 8px 24px rgba(0,0,0,0.12) | Elevated elements |
| `shadow-mockup` | 0 0 20px rgba(0,0,0,0.12) | Device mockups |

---

## Component Overrides (Optional)

Custom values for specific components that differ from global tokens.

### Feature Card (Case Study)

| Property | Value | Notes |
|----------|-------|-------|
| width | 390px | Fixed width |
| image-height | 280px | Image area |
| title-color | #EE7BB3 | Pink title |
| description-color | #838383 | Gray text |
| hover-expand | +50px | Height increase on hover |

### Status Badge

| Property | Value |
|----------|-------|
| height | 16px |
| font-size | 7px |
| background | #E6EAF3 |
| text-color | #4E596D |
| dot-open | #2CD552 |
| dot-closed | #D52C2C |

### Stats Module

| Property | Value |
|----------|-------|
| height | 512px |
| padding-x | 200px |
| padding-y | 83px |

### Content Panel

| Property | Value |
|----------|-------|
| background | #FAFAFA |
| border | 1px solid #E3E3E3 |
| padding | 48px |

### Link Text

| Property | Value |
|----------|-------|
| font-size | 9px |
| font-weight | 700 |
| letter-spacing | 2px |
| color-pink | #DA85B2 |

---

## Button Hierarchy

| Type | Background | Text | Use |
|------|------------|------|-----|
| Primary | #333333 | #FFFFFF | Main CTA |
| Accent | #6DC4AD | #FFFFFF | Secondary CTA |
| Submit | #E19379 | #FFFFFF | Form submissions |
| Ghost | transparent | #333333 | Tertiary |

---

## Text Contrast Rules

| Background | Text Color |
|------------|-----------|
| #401877 (Purple) | #FFFFFF |
| #121D35 (Dark Blue) | #FFFFFF |
| #6DC4AD (Teal) | #333333 |
| #EE7BB3 (Pink) | #333333 |
| #F3A326 (Orange) | #333333 |

---

## Service Line Colors

| Service | Token | Hex |
|---------|-------|-----|
| Strategy | color-accent | #EE7BB3 |
| Technology | color-primary | #6DC4AD |
| Design | color-accent-alt | #A070A6 |

---

## Content Badge Colors

| Type | Background | Text |
|------|-----------|------|
| Case Study | #401877 | #FFFFFF |
| Article | #E19379 | #FFFFFF |
| Insight | #6DC4AD | #333333 |
| News | #F3A326 | #333333 |
