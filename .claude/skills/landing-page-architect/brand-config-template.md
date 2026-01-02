# Brand Configuration Template

Copy this file to `brand-config.md` and fill in your brand's values.

> **Setup Instructions:**
> 1. Copy this file to `brand-config.md` in the same directory
> 2. Replace all `[PLACEHOLDER]` values with your brand's actual values
> 3. Delete sections you don't need (marked as Optional)
> 4. The design system will automatically use your values

---

## Brand Identity

| Property | Value |
|----------|-------|
| **Brand Name** | [YOUR_BRAND_NAME] |
| **Design Source** | [YOUR_DESIGN_SYSTEM_NAME] (e.g., Figma, Zeplin, Design Spec) |
| **Last Updated** | [DATE] |

---

## Required Values

### Primary Colors

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `color-primary` | [#HEX] | [H S% L%] | Main CTA, primary actions |
| `color-secondary` | [#HEX] | [H S% L%] | Secondary buttons |
| `color-accent` | [#HEX] | [H S% L%] | Highlights, badges |
| `color-accent-alt` | [#HEX] | [H S% L%] | Alternative accent (optional) |
| `color-purple` | [#HEX] | [H S% L%] | Premium/hero contexts (optional) |

> **Tip:** Use a tool like [HSL Color Picker](https://hslpicker.com) to convert hex to HSL.

### CTA Colors (Optional)

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `color-cta-pink` | [#HEX] | [H S% L%] | Link text color |
| `color-cta-coral` | [#HEX] | [H S% L%] | Submit button color |

### Statistics Accents (Optional)

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `color-stat-1` | [#HEX] | [H S% L%] | First stat color |
| `color-stat-2` | [#HEX] | [H S% L%] | Second stat color |
| `color-stat-3` | [#HEX] | [H S% L%] | Third stat color |

### Neutral Colors

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `color-foreground` | [#HEX] | [H S% L%] | Primary text |
| `color-muted` | [#HEX] | [H S% L%] | Secondary text |
| `color-near-black` | [#HEX] | [H S% L%] | Headlines, emphasis |

### Surface Colors (Light Mode)

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `surface-background` | [#HEX] | [H S% L%] | Page background |
| `surface-card` | [#HEX] | [H S% L%] | Card backgrounds |
| `surface-muted` | [#HEX] | [H S% L%] | Content panels |

### Surface Colors (Dark Mode)

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `surface-dark` | [#HEX] | [H S% L%] | Dark section background |
| `surface-dark-card` | [#HEX] | [H S% L%] | Cards on dark |
| `surface-dark-alt` | [#HEX] | [H S% L%] | Alternate on dark |

### Border Colors

| Token | Hex | HSL | Description |
|-------|-----|-----|-------------|
| `color-border` | [#HEX] | [H S% L%] | Default borders |
| `color-border-light` | [#HEX] | [H S% L%] | Subtle card borders |
| `color-divider` | [#HEX] | [H S% L%] | Section dividers |

---

## Typography

### Font Families

| Role | Font Family | Fallback | Use |
|------|-------------|----------|-----|
| `font-primary` | [YOUR_HEADING_FONT] | system-ui, sans-serif | Headings, navigation, meta labels |
| `font-body` | [YOUR_BODY_FONT] | system-ui, sans-serif | Body copy |
| `font-editorial` | [YOUR_EDITORIAL_FONT] | Georgia, serif | Article headlines, pull quotes (optional) |
| `font-code` | [YOUR_CODE_FONT] | monospace | Code blocks |

> **Common Choices:**
> - Headings: Inter, Manrope, Poppins, Space Grotesk
> - Body: Inter, Roboto, Open Sans, Graphik
> - Editorial: Playfair Display, Merriweather, Georgia (serif for contrast)
> - Code: JetBrains Mono, Fira Code, Source Code Pro

### Font Weights

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 Hero | font-primary | [WEIGHT] | [SIZE]px |
| H2 Section | font-primary | [WEIGHT] | [SIZE]px |
| H3 Card | font-primary | [WEIGHT] | [SIZE]px |
| Body | font-body | [WEIGHT] | [SIZE]px |
| Caption | font-body | [WEIGHT] | [SIZE]px |

### Letter Spacing (Optional)

| Token | Value | Use |
|-------|-------|-----|
| `ls-tight` | [VALUE]px | Large headlines |
| `ls-headline` | [VALUE]px | Subheadings |
| `ls-normal` | 0 | Body text |
| `ls-wide` | [VALUE]px | Labels |
| `ls-wider` | [VALUE]px | Navigation |

---

## Spacing

| Token | Value |
|-------|-------|
| `space-1` | [VALUE]px |
| `space-2` | [VALUE]px |
| `space-4` | [VALUE]px |
| `space-6` | [VALUE]px |
| `space-8` | [VALUE]px |
| `space-12` | [VALUE]px |
| `space-16` | [VALUE]px |

> **Common Pattern:** 4px base unit (4, 8, 16, 24, 32, 48, 64)

---

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-badge` | [VALUE]px | Badges, small elements |
| `radius-card` | [VALUE]px | Cards, buttons |
| `radius-panel` | [VALUE]px | Large panels |

> **Common Values:**
> - Sharp: 2px, 4px
> - Soft: 8px, 12px
> - Round: 16px, 24px, 34px

---

## Shadows

| Token | Value | Use |
|-------|-------|-----|
| `shadow-card` | [YOUR_SHADOW] | Default card shadow |
| `shadow-card-hover` | [YOUR_SHADOW] | Hover state (typically 2-3x intensity) |
| `shadow-elevated` | [YOUR_SHADOW] | Elevated elements |

> **Example Values:**
> - Subtle: `0 1px 3px rgba(0,0,0,0.1)`
> - Medium: `0 4px 12px rgba(0,0,0,0.15)`
> - Strong: `0 8px 24px rgba(0,0,0,0.2)`

---

## Component Overrides (Optional)

Custom values for specific components. Delete sections you don't need.

### Feature Card

| Property | Value | Notes |
|----------|-------|-------|
| width | [VALUE]px | Fixed or max-width |
| image-height | [VALUE]px | Image area |
| title-color | [#HEX] | Title text color |
| description-color | [#HEX] | Description color |
| hover-expand | [VALUE]px | Height increase on hover |

### Status Badge

| Property | Value |
|----------|-------|
| height | [VALUE]px |
| font-size | [VALUE]px |
| background | [#HEX] |
| text-color | [#HEX] |

### Stats Module

| Property | Value |
|----------|-------|
| height | [VALUE]px |
| padding-x | [VALUE]px |
| padding-y | [VALUE]px |

### Content Panel

| Property | Value |
|----------|-------|
| background | [#HEX] |
| border | [BORDER_VALUE] |
| padding | [VALUE]px |

---

## Button Hierarchy

| Type | Background | Text | Use |
|------|------------|------|-----|
| Primary | [#HEX] | [#HEX] | Main CTA |
| Secondary | [#HEX] | [#HEX] | Secondary CTA |
| Submit | [#HEX] | [#HEX] | Form submissions |
| Ghost | transparent | [#HEX] | Tertiary |

---

## Text Contrast Rules

| Background Color | Text Color |
|-----------------|-----------|
| [DARK_BG_HEX] | #FFFFFF |
| [LIGHT_BG_HEX] | #333333 |

---

## Service/Category Colors (Optional)

Map content types to colors for consistent categorization.

| Category | Token | Hex |
|----------|-------|-----|
| [CATEGORY_1] | color-[name] | [#HEX] |
| [CATEGORY_2] | color-[name] | [#HEX] |
| [CATEGORY_3] | color-[name] | [#HEX] |

---

## Checklist

Before using this skill, verify:

- [ ] All `[PLACEHOLDER]` values replaced
- [ ] Colors tested for accessibility (WCAG AA contrast)
- [ ] Fonts available (Google Fonts or self-hosted)
- [ ] Shadows look good at different viewport sizes
- [ ] Button hierarchy clear and distinct
