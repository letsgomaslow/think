# Zeplin UI Standards Documentation

This document captures UI component specifications extracted from Zeplin designs to ensure brand consistency in the `landing-page-architect` skill.

**Status:** In Progress - Collecting screen analyses before implementation
**Last Updated:** December 29, 2025

---

## Screens Analyzed

| # | Screen Name | Zeplin ID | Status |
|---|-------------|-----------|--------|
| 1 | Landing Page | `5f176e76f465e56a81d19700` | Documented |
| 2 | Home | `awR9WA7` | Documented |
| 3 | Case Studies | `bJmj9lD` | Documented |
| 4 | Capabilities | `amkz9qA` | Documented |

---

## Screen 1: Landing Page

**Zeplin URL:** `https://app.zeplin.io/project/5f176dc918633c7a16e947b1/screen/5f176e76f465e56a81d19700`

### Design Tokens

#### Colors

| Token Name | RGB Value | Hex | Notes |
|------------|-----------|-----|-------|
| darkish-purple | rgb(64, 24, 119) | #401877 | Brand purple |
| very-light-pink | rgb(238, 238, 238) | #EEEEEE | Surface alt |
| purpleish | rgb(157, 75, 142) | #9D4B8E | Accent |
| white | rgb(255, 255, 255) | #FFFFFF | Surface |
| black | rgb(51, 51, 51) | #333333 | Text primary |
| pinkish-tan | rgb(225, 147, 121) | #E19379 | Submit button |
| brown-grey | rgb(165, 165, 165) | #A5A5A5 | Text secondary |
| cool-blue | rgb(70, 157, 187) | #469DBB | Links |

#### Typography

| Style Name | Font | Size | Weight | Letter Spacing | Line Height |
|------------|------|------|--------|----------------|-------------|
| h1-project-title | NocturnoDisplay-Med | 90px | 400 | -1.4px | 102px |
| project-sub-headings | Graphik | 24px | 700 | -0.57px | 26px |
| project-paragraph | Graphik | 15px | 400 | 0 | 24px |
| project-meta-text | Graphik | 12px | 400 | 0.2px | 18px |
| text-style (labels) | Manrope | 12px | 600 | 0.4px | 16px |
| orange-meta-label | GraphikCond | 12px | 700 | 4px | 18px |

---

### Component: Highbrow Card (Case Study Card)

A card component for showcasing case studies, client work, and portfolio items.

#### Specifications

| Property | Value |
|----------|-------|
| Width | 590px (flexible) |
| Height | 476px (flexible) |
| Background | #FFFFFF |
| Border | 1px solid #F1F1F1 |
| Border Radius | **4px** |
| Shadow | `0 0 4px rgba(0, 0, 0, 0.25)` at 24.7% opacity |

#### Structure

```
┌─────────────────────────────┐
│                             │
│         Image Area          │
│                             │
├─────────────────────────────┤
│ Title (Pink #EE7BB3)        │
│ Description text here       │
│ continues on multiple lines │
└─────────────────────────────┘
```

#### Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Title | Manrope | 21px | 600 | #EE7BB3 (Pink) |
| Description | Manrope | 17px | 400 | #838383 |

#### CSS Reference

```css
.highbrow-card {
  width: 590px;
  height: 476px;
  background: #FFFFFF;
  border: 1px solid #F1F1F1;
  border-radius: 4px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.highbrow-card-image {
  width: 100%;
  height: 280px;
  object-fit: cover;
}

.highbrow-card-content {
  padding: 24px;
}

.highbrow-card-title {
  font-family: 'Manrope', sans-serif;
  font-size: 21px;
  font-weight: 600;
  color: #EE7BB3;
  margin-bottom: 8px;
}

.highbrow-card-description {
  font-family: 'Manrope', sans-serif;
  font-size: 17px;
  font-weight: 400;
  color: #838383;
  line-height: 21px;
}
```

---

### Component: Status Badge

A small indicator component for showing status states.

#### Specifications

| Property | Value |
|----------|-------|
| Background | #E6EAF3 (silver-bg) |
| Border Radius | **2px** |
| Height | 16px |
| Padding | 0 6px |

#### Structure

```
┌──────────────────┐
│ LABEL TEXT    ●  │
└──────────────────┘
```

#### Typography

| Element | Font | Size | Weight | Letter Spacing | Color |
|---------|------|------|--------|----------------|-------|
| Text | Manrope | 7px | 500 | 0.4px | #4E596D |

#### Status Dot Colors

| Status | Color | Hex |
|--------|-------|-----|
| Success/Open | Green | #2CD552 |
| Error/Closed | Red | #D52C2C |

#### CSS Reference

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #E6EAF3;
  border-radius: 2px;
  padding: 0 6px;
  height: 16px;
}

.badge-text {
  font-family: 'Manrope', sans-serif;
  font-size: 7px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: #4E596D;
  text-transform: uppercase;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.badge-dot--success {
  background: #2CD552;
}

.badge-dot--error {
  background: #D52C2C;
}
```

---

### Component: Navigation

Header navigation bar specifications.

#### Logo

| Property | Value |
|----------|-------|
| Font | Manrope |
| Size | 14px |
| Weight | 600 |
| Letter Spacing | 2px |
| Transform | uppercase |
| Color (Light BG) | #192332 |
| Color (Dark BG) | #FFFFFF |

#### Divider

| Property | Value |
|----------|-------|
| Height | 1px |
| Color | #E6EAF3 |

#### CSS Reference

```css
.nav-logo {
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.nav-logo--light {
  color: #192332;
}

.nav-logo--dark {
  color: #FFFFFF;
}

.nav-divider {
  height: 1px;
  background: #E6EAF3;
  width: 100%;
}
```

---

## Border Radius Standards

Based on Zeplin analysis:

| Component Type | Border Radius | Token Suggestion |
|----------------|---------------|------------------|
| Cards (Highbrow) | 4px | `--radius-card` |
| Badges | 2px | `--radius-xs` |
| Buttons | 4px | `--radius-button` |
| Input fields | 4px | `--radius-input` |

**Note:** Current skill uses 8px for cards (`--radius-md`). Zeplin shows 4px.

---

## Shadow Standards

Based on Zeplin analysis:

| Component | Shadow | Effective Opacity |
|-----------|--------|-------------------|
| Highbrow Card | `0 0 4px rgba(0,0,0,0.25)` | 0.06 (with layer opacity) |
| Card Hover | TBD | TBD |

#### CSS Token Suggestions

```css
--shadow-card: 0 0 4px rgba(0, 0, 0, 0.06);
--shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
--shadow-elevated: 0 8px 24px rgba(0, 0, 0, 0.12);
```

---

## Letter Spacing Standards

Based on Zeplin analysis:

| Usage | Letter Spacing | Token Suggestion |
|-------|----------------|------------------|
| Headlines | -1.4px to -0.5px | `--ls-tight` |
| Body | 0 | `--ls-normal` |
| Labels | 0.2px - 0.4px | `--ls-wide` |
| Logos/Badges | 2px | `--ls-wider` |
| Meta Labels | 4px | `--ls-widest` |

---

---

## Screen 2: Home

**Zeplin URL:** `https://zpl.io/awR9WA7`
**Screen Name:** Home
**Dimensions:** 1400 x 2720px

### Design Tokens

Colors confirmed identical to Screen 1 - brand palette is consistent.

### Typography (NEW Discoveries)

| Style Name | Font | Size | Weight | Letter Spacing | Line Height | Color |
|------------|------|------|--------|----------------|-------------|-------|
| hero-headline | Manrope | 60px | 600 | -1.4px | 62px | #192332 |
| hero-secondary | Manrope | 60px | 400 | -1.4px | 62px | #838383 |
| meta-label | FoundersGroteskMono | 10px | 500 | 3px | - | #C1C1C1 |
| link-text | Manrope | 9px | 700 | 2px | 13px | - |
| nav-links | Manrope | 11px | 600 | 2px | 16px | #192332 |

### NEW Font: FoundersGroteskMono

Monospace font used for meta labels - NOT in current skill tokens!

```css
.meta-label {
  font-family: 'FoundersGroteskMono', monospace;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 3px;
  color: #C1C1C1;
  text-transform: uppercase;
}
```

---

### Component: Highbrow Card (Size Variants & Hover State)

Multiple card sizes exist, plus an **expanded hover state** with enhanced shadow and CTA reveal.

#### Size Variants

| Property | Large (Screen 1) | Medium (Screen 2) |
|----------|------------------|-------------------|
| Width | 590px | 390px |
| Height | 476px | 509px |
| Border Radius | 4px | 4px |
| Shadow Opacity | 24.7% | 24.7% |
| Border | 1px #F1F1F1 | 1px #F1F1F1 |

#### Hover/Expanded State (Showcase Hub Pattern)

**Critical interaction pattern:** On hover, the card expands and reveals a CTA.

| Property | Default State | Hover/Expanded State | Change |
|----------|---------------|----------------------|--------|
| Height | 509px | **559px** | +50px |
| Matte Height | 500px | **548px** | +48px |
| Shadow Opacity | 0.247864 (25%) | **0.75 (75%)** | **3x stronger** |
| VIEW CASE STUDY | Hidden | **Visible** | Reveals pink CTA |
| Company Name | Hidden | **Visible** | 15px Manrope 600 |

#### CSS Reference (Hover State)

```css
.highbrow-card {
  width: 390px;
  height: 509px;
  background: #FFFFFF;
  border: 1px solid #F1F1F1;
  border-radius: 4px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.06); /* 0.25 * 0.247864 */
  transition: all 0.3s ease;
  overflow: hidden;
}

.highbrow-card:hover {
  height: 559px; /* +50px expansion */
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.19); /* 0.25 * 0.75 */
}

.highbrow-card .cta-overlay {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.highbrow-card:hover .cta-overlay {
  opacity: 1;
  transform: translateY(0);
}

.view-case-study {
  font-family: 'Manrope', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 13px;
  color: #DA85B2; /* Pink accent - NEW color! */
  text-transform: uppercase;
}
```

#### NEW Color Discovery: #DA85B2

The "VIEW CASE STUDY" link uses a pink accent color **#DA85B2** (rgb 218, 133, 178) that is NOT in the current skill tokens!

---

### Component: Link Text (VIEW ALL / READ MORE)

Text links with arrow indicators.

#### Specifications

| Property | Value |
|----------|-------|
| Font | Manrope |
| Size | 9px |
| Weight | 700 (Bold) |
| Letter Spacing | 2px |
| Line Height | 13px |
| Alignment | Right |
| Format | "TEXT  >" (uppercase with arrow) |

#### CSS Reference

```css
.link-text {
  font-family: 'Manrope', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 13px;
  text-transform: uppercase;
  text-align: right;
}
```

---

### Component: Section Background

Subtle gray tint for alternating sections.

#### Specifications

| Property | Value |
|----------|-------|
| Background | rgb(216, 216, 216) |
| Opacity | 0.15 (15%) |
| Effect | `rgba(216, 216, 216, 0.15)` |
| Usage | Cases section, alternating backgrounds |

#### CSS Reference

```css
.section-alt-bg {
  background-color: rgba(216, 216, 216, 0.15);
}
```

---

### Component: Status Badge (Confirmed)

Confirmed specifications from Screen 1.

| Property | Value |
|----------|-------|
| Width | 64px |
| Height | 16px |
| Border Radius | 2px |
| Background | #E6EAF3 |
| Text Size | 7px |
| Dot Size | 6px |
| Open State | Green #2CD552 |
| Closed State | Red #D52C2C |

---

### Page Sections

1. Navigation (confirmed)
2. Hero (two-tone text styling)
3. Cases (Highbrow cards grid)
4. About
5. Insights
6. Capabilities
7. Footer (confirmed)

---

## Screen 3: Case Studies

**Zeplin URL:** `https://zpl.io/bJmj9lD`
**Screen Name:** Case Studies
**Dimensions:** 1400 x 4111px (long-form case study page)

### Design Tokens

Colors confirmed identical to Screen 1 + 2 - brand palette is consistent.

### NEW Color Discoveries (Statistics Accents)

| Color Name | RGB | Hex | Usage |
|------------|-----|-----|-------|
| Stat Teal | rgb(115, 193, 174) | #73C1AE | Statistics accent (85% increase) |
| Stat Orange | rgb(235, 169, 61) | #EBA93D | Statistics accent (94% delight) |
| Stat Purple | rgb(160, 112, 166) | #A070A6 | Statistics accent (3/4 customers) |
| Section Divider | rgb(160, 112, 166) | #A070A6 | Purple line above sections |

---

### Component: Results Module (Statistics Dark Band)

Full-width dark section for showcasing metrics.

#### Specifications

| Property | Value |
|----------|-------|
| Width | 1400px (full-width) |
| Height | 512px |
| Background | #121D35 (Dark Blue) |
| Top Line | 1px #E1E1E1 at 30% opacity |
| Vertical Dividers | 1px #979797 at 30% opacity |

#### Typography

| Element | Font | Size | Weight | Letter Spacing | Color |
|---------|------|------|--------|----------------|-------|
| Section Label | Manrope | 17px | 500 | 0.28px | #FFFFFF |
| Stat Number | Manrope | 38px | 400 | -0.89px | (accent colors) |
| Stat Description | Manrope | 17px | 400 | 0.28px | #FFFFFF |

#### CSS Reference

```css
.results-module {
  width: 100%;
  height: 512px;
  background: #121D35;
  padding: 83px 200px;
}

.stat-number {
  font-family: 'Manrope', sans-serif;
  font-size: 38px;
  font-weight: 400;
  letter-spacing: -0.89px;
  line-height: 42px;
}

.stat-number--teal { color: #73C1AE; }
.stat-number--orange { color: #EBA93D; }
.stat-number--purple { color: #A070A6; }

.stat-description {
  font-family: 'Manrope', sans-serif;
  font-size: 17px;
  font-weight: 400;
  letter-spacing: 0.28px;
  line-height: 27px;
  color: #FFFFFF;
}
```

---

### Component: Module 1 (Content + Phone Mockup)

Content section with phone mockup and descriptive text.

#### Specifications

| Property | Value |
|----------|-------|
| Width | 1000px |
| Height | 612px |
| Layout | 2-column (phones left, text right) |
| Divider Line | 1px #A070A6 (purple accent) |

#### Phone Mockup Shadow

| Property | Value |
|----------|-------|
| Color | rgba(0, 0, 0, 0.1) |
| Opacity | 12% |
| Blend Mode | Multiply |

#### Typography

| Element | Font | Size | Weight | Letter Spacing | Color |
|---------|------|------|--------|----------------|-------|
| Headline | Manrope | 24px | 700 | -0.57px | #1A1A1A |
| Meta Summary | Manrope | 15px | 400 | 0 | #666666 |

---

### Component: Module 2 (Rounded Content Panel)

Large rounded panel for content sections - **DIFFERENT from 4px card radius!**

#### Specifications

| Property | Value |
|----------|-------|
| Width | 600px |
| Height | 433px |
| Background | #FAFAFA |
| Border | 1px inside #E3E3E3 |
| **Border Radius** | **34px** |
| Divider Line | 1px #A070A6 (purple accent above) |

#### Typography

| Element | Font | Size | Weight | Letter Spacing | Color |
|---------|------|------|--------|----------------|-------|
| Headline | Manrope | 24px | 700 | -0.57px | #1A1A1A |
| Bullet Points | Manrope | 15px | 400 | 0 | #666666 |
| Bullet Dot | - | - | - | - | #73C1AE (teal) |

#### CSS Reference

```css
.content-panel {
  width: 600px;
  height: 433px;
  background: #FAFAFA;
  border: 1px solid #E3E3E3;
  border-radius: 34px; /* LARGE radius for content panels */
}

.bullet-list li::before {
  content: "•";
  color: #73C1AE; /* Teal accent */
  margin-right: 8px;
}
```

---

## Border Radius Standards (Updated)

Based on 3-screen analysis, TWO distinct radius scales are used:

| Component Type | Border Radius | Token Suggestion |
|----------------|---------------|------------------|
| Badges | 2px | `--radius-xs` |
| Cards (Highbrow) | 4px | `--radius-sm` |
| Buttons | 4px | `--radius-sm` |
| Input fields | 4px | `--radius-input` |
| **Content Panels** | **34px** | `--radius-xl` |

**Key Insight:** Small/precise (2-4px) for cards, badges, buttons. Large/soft (34px) for content panels/modules.

---

## Screen 4: Capabilities

**Zeplin URL:** `https://zpl.io/amkz9qA`
**Screen Name:** Capabilities
**Dimensions:** 1400 x 3375px

### Design Tokens

Colors confirmed identical to Screens 1-3 - brand palette is consistent.

---

### Component: Marquee (Hero Banner)

Full-width hero section with shadow effect.

#### Specifications

| Property | Value |
|----------|-------|
| Width | 1400px (full-width) |
| Height | 560px |
| Background | #FFFFFF |
| **Shadow** | **0 2px 10px rgba(0,0,0,0.1)** |

#### Typography

| Element | Font | Size | Weight | Letter Spacing | Color |
|---------|------|------|--------|----------------|-------|
| Hero Headline | Manrope | 60px | 600 | -1.4px | #192332 |
| Secondary | Manrope | 60px | 400 | -1.4px | #838383 |

#### CSS Reference

```css
.marquee {
  width: 100%;
  height: 560px;
  background: #FFFFFF;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.marquee-headline {
  font-family: 'Manrope', sans-serif;
  font-size: 60px;
  font-weight: 600;
  letter-spacing: -1.4px;
  line-height: 62px;
  color: #192332;
}

.marquee-secondary {
  font-family: 'Manrope', sans-serif;
  font-size: 60px;
  font-weight: 400;
  letter-spacing: -1.4px;
  line-height: 62px;
  color: #838383;
}
```

---

### Component: Transition Section (Image + Header)

Content section with large image and section header.

#### Specifications

| Property | Value |
|----------|-------|
| Width | 1400px |
| Height | 527px |
| Image Height | 400px |
| Section Label | "What we do" |
| Divider | 1px #E1E1E1 |

---

### Component: Capability Module (Two-Tone Pattern)

Content modules with two-tone headline styling - first word in accent color.

#### Specifications

| Property | Value |
|----------|-------|
| Width | 1002px |
| Height | ~299px (flexible) |

#### Two-Tone Headline (CONFIRMED Pattern)

| Element | Font | Size | Weight | Letter Spacing | Color |
|---------|------|------|--------|----------------|-------|
| First Word | Manrope | 38px | 400 | -0.89px | **#A070A6** (purple accent) |
| Remaining Text | Manrope | 38px | 400 | -0.89px | #1B1F24 (near-black) |

#### Bullet List (Purple Accent)

| Element | Font | Size | Weight | Letter Spacing | Color |
|---------|------|------|--------|----------------|-------|
| Bullet Dot | - | 15px | - | - | #A070A6 (purple) |
| List Text | Manrope | 13px | 400 | 0.22px | #838383 |

#### CSS Reference

```css
.capability-headline {
  font-family: 'Manrope', sans-serif;
  font-size: 38px;
  font-weight: 400;
  letter-spacing: -0.89px;
  line-height: 42px;
}

.capability-headline .accent {
  color: #A070A6; /* Purple accent for first word */
}

.capability-headline .dark {
  color: #1B1F24;
}

.capability-list li {
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.22px;
  color: #838383;
}

.capability-list li::before {
  content: "•";
  color: #A070A6;
  margin-right: 8px;
}
```

---

### Component: Insights List (News/Blog)

News/blog list with date metadata and links.

#### Specifications

| Property | Value |
|----------|-------|
| Width | 1005px |
| Row Height | ~57px |
| Dividers | 1px #E1E1E1 |

#### Typography

| Element | Font | Size | Weight | Letter Spacing | Color |
|---------|------|------|--------|----------------|-------|
| READ MORE Link | Manrope | 9px | 700 | 2px | #DA85B2 (pink) |
| Date Meta | Manrope | 9px | 400 | **2.25px** | #141414 |
| Title | Manrope | 15px | 400 | 0 | #141414 |

#### CSS Reference

```css
.insights-list-item {
  display: flex;
  align-items: center;
  height: 57px;
  border-bottom: 1px solid #E1E1E1;
}

.insights-date {
  font-family: 'Manrope', sans-serif;
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 2.25px;
  color: #141414;
  text-transform: uppercase;
}

.insights-title {
  font-family: 'Manrope', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #141414;
}

.insights-link {
  font-family: 'Manrope', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #DA85B2;
  text-transform: uppercase;
}
```

---

### Patterns Confirmed from Previous Screens

- READ MORE link styling (#DA85B2 pink) ✓
- Section label typography (17px, 500 weight) ✓
- Stat accent color (#A070A6 purple) ✓
- Bullet accent color (#A070A6 purple) ✓
- Hero two-tone text styling ✓
- Section divider (#E1E1E1) ✓

---

## Gap Analysis Summary

| Gap | Description | Priority | Source |
|-----|-------------|----------|--------|
| 1 | Border radius (4px vs 8px for cards) | HIGH | Screen 1 + 2 |
| 2 | Shadow tokens not specified | HIGH | Screen 1 + 2 |
| 3 | Status Badge component missing | MEDIUM | Screen 1 + 2 |
| 4 | Letter spacing tokens missing | MEDIUM | Screen 1 + 2 |
| 5 | Highbrow Card pattern missing | MEDIUM | Screen 1 + 2 |
| 6 | Purple Mid (#9D4B8E) color missing | LOW | Screen 1 |
| **7** | **FoundersGroteskMono font missing** | **MEDIUM** | **Screen 2** |
| **8** | **Hero two-tone styling pattern** | **LOW** | **Screen 2** |
| **9** | **Link text pattern (9px bold)** | **MEDIUM** | **Screen 2** |
| **10** | **Card hover state (expand + shadow intensify)** | **HIGH** | **Screen 2** |
| **11** | **Pink CTA color (#DA85B2) missing** | **MEDIUM** | **Screen 2** |
| **12** | **Statistics Component pattern** | **MEDIUM** | **Screen 3** |
| **13** | **3 NEW accent colors (#73C1AE, #EBA93D, #A070A6)** | **MEDIUM** | **Screen 3** |
| **14** | **Large border radius (34px) for content panels** | **HIGH** | **Screen 3** |
| **15** | **Phone mockup shadow specs** | **LOW** | **Screen 3** |
| **16** | **Section divider line (#A070A6)** | **LOW** | **Screen 3** |
| **17** | **Marquee shadow spec (0 2px 10px)** | **LOW** | **Screen 4** |
| **18** | **Two-tone headline pattern (purple + dark)** | **MEDIUM** | **Screen 4** |
| **19** | **Date meta typography (9px, 2.25px spacing)** | **LOW** | **Screen 4** |
| **20** | **Section divider pattern (#E1E1E1)** | **LOW** | **Screen 4** |

### Gap Count by Priority

| Priority | Count | Examples |
|----------|-------|----------|
| HIGH | 4 | Border radius 4px, Shadow tokens, Card hover state, Content panel 34px |
| MEDIUM | 12 | Statistics pattern, Badge component, Accent colors, Typography |
| LOW | 4 | Marquee shadow, Date meta, Section dividers |

---

## Implementation Notes

**DO NOT IMPLEMENT YET** - Waiting for additional Zeplin screens to be analyzed before making changes to skill files.

### Files to Update (After All Screens Reviewed)

1. `.claude/skills/landing-page-architect/design-integration/maslow-tokens.md`
2. `.claude/skills/landing-page-architect/component-patterns/section-types.md`
3. `.claude/skills/landing-page-architect/design-integration/anti-patterns.md`

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-29 | Initial document created with Screen 1 (Landing Page) analysis |
| 2025-12-29 | Added Screen 2 (Home) analysis - discovered FoundersGroteskMono font, link text patterns, section backgrounds |
| 2025-12-29 | Added Highbrow Card hover state (Showcase Hub pattern) - card expand +50px, shadow 3x, CTA reveal, new pink #DA85B2 |
| 2025-12-29 | Added Screen 3 (Case Studies) - discovered Results Module, Content Panel (34px radius), 3 NEW accent colors |
| 2025-12-29 | Added Screen 4 (Capabilities) - discovered Marquee shadow, Two-tone headline pattern, Insights List component |
