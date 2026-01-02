# Landing Page Strategy for Hypothesis Tool

## Value Proposition
**Guide complex problem-solving through formal scientific method with structured hypothesis testing, falsifiable predictions, and evidence-based iteration.**

## Target Audience
- Product managers testing assumptions before building features
- Developers debugging performance issues systematically
- Researchers designing A/B tests and experiments
- Analysts performing root cause investigations
- Teams who want to stop guessing and start testing

## Tool Accent Color
**Blue #469DBB** - Scientific, analytical, trustworthy

---

## Page Sections

### 1. Hero Section
**Story Element:** Character + Aspiration

**Content:**
- Eyebrow: THINK-MCP TOOLS
- Headline: **Test ideas** with scientific rigor
- Subheadline: Stop guessing and start testing. Apply formal hypothesis testing to any problem—from product decisions to performance issues.
- Primary CTA: Try Hypothesis
- Secondary CTA: See Examples
- Visual: Scientific method flow diagram with stages (Observation → Hypothesis → Experiment → Analysis)

**Shadcn Query:** `hero 2-column asymmetric with animated diagram`

**Anti-patterns Avoided:**
- ❌ Generic centered hero with two buttons
- ❌ Purple/blue AI gradients (#a855f7, #8b5cf6)
- ❌ Fade-up animation on load

**Brand Alignment:**
- Layout: 2-column grid (60/40), visual on right
- Background: var(--silver-bg) #E6EAF3
- Accent line: 3px height, 60px width, #469DBB (hypothesis blue)
- Typography: Manrope 800 bold "Test ideas" + Manrope 300 light "with scientific rigor"
- Primary CTA: #333333 bg, white text
- Secondary CTA: Ghost style, #333333 text

---

### 2. Stakes Section
**Story Element:** The Problem (External, Internal, Philosophical)

**Content:**
- Section headline: Assumptions kill products
- Pain points:
  1. **Gut feelings aren't evidence** (External) - Teams ship features based on intuition, not data
  2. **Confirmation bias blinds you** (Internal) - You see what you want to see, missing critical signals
  3. **Expensive pivots from untested ideas** (Philosophical) - Wasted months building the wrong thing

**Shadcn Query:** `problem cards 3-column with minimal icons`

**Anti-patterns Avoided:**
- ❌ Glass-morphism cards
- ❌ Fade-up animation on each card
- ❌ Heroicons on every card
- ❌ Rainbow gradient backgrounds

**Brand Alignment:**
- Background: #FFFFFF (surface)
- Card borders: 1px #D0D5E0
- Hover state: translateY(-4px) + 3px left border #469DBB
- Icons: Minimal line style, #469DBB stroke
- Text: #333333 primary, #A5A5A5 secondary

---

### 3. Guide Section (Features)
**Story Element:** Authority + Empathy

**Content:**
- Empathy statement: "We know what it's like to chase hunches that lead nowhere. Every team has shipped something they later realized no one wanted."
- Authority features:
  1. **Structured Hypotheses** - Define statements, variables, and assumptions explicitly
  2. **Falsifiable Predictions** - If-then-else format forces testable outcomes
  3. **Experiment Design** - Control measures, methodology, and success criteria
  4. **Evidence Tracking** - Results, unexpected observations, and honest limitations

**Shadcn Query:** `feature cards 4-column grid with icon backgrounds`

**Anti-patterns Avoided:**
- ❌ Generic "feature list" layout
- ❌ Same icon style as stakes section
- ❌ Inter/Arial fonts
- ❌ Rounded corners everywhere

**Brand Alignment:**
- Background: #E6EAF3 (silver-bg)
- Icon backgrounds: #EBF7F4 (teal tint) circles
- Card surface: #FFFFFF
- Grid gap: 32px (--space-8)
- Typography: Manrope 600 for titles, Graphik 400 for descriptions

---

### 4. Process Section (Plan)
**Story Element:** The Path (3 steps max)

**Content:**
- Section headline: From observation to conclusion
- Steps:
  1. **Observe & Question** - Notice something interesting and formulate what you want to understand
  2. **Hypothesize & Experiment** - Propose an explanation with variables, design a test with predictions
  3. **Analyze & Conclude** - Evaluate results, update beliefs, iterate as needed

**Shadcn Query:** `steps section 3 horizontal numbered with connectors`

**Anti-patterns Avoided:**
- ❌ More than 3 steps
- ❌ Vertical timeline (use horizontal for flow)
- ❌ Complex iconography
- ❌ Generic numbered circles

**Brand Alignment:**
- Background: #FFFFFF (surface)
- Step numbers: 48px circles, #469DBB border, #FFFFFF fill
- Connector lines: 2px dashed #D0D5E0
- Active/hover: #469DBB filled circle
- Typography: Manrope 700 step titles, Graphik 400 descriptions

---

### 5. Demo Section (Transitional CTA)
**Story Element:** Show the tool in action

**Content:**
- Context: "See how Hypothesis structures a real investigation"
- Example: Conversion rate drop investigation
  - Tab 1: Hypothesis stage (statement, variables, confidence)
  - Tab 2: Experiment stage (design, predictions, control measures)
  - Tab 3: Conclusion stage (results, unexpected findings, next steps)
- Micro-CTA: "Try this example"

**Shadcn Query:** `demo panel dark background with tabbed code preview`

**Anti-patterns Avoided:**
- ❌ Light demo on light background (no contrast)
- ❌ Fake terminal with blinking cursor
- ❌ Auto-playing animation
- ❌ Arbitrary dark colors

**Brand Alignment:**
- Background: #121D35 (dark-blue) - DARK BAND
- Surface: #1A2847 (dark-surface) for demo panel
- Tab backgrounds: #243356 (dark-surface-alt)
- Active tab: #469DBB left border
- Code font: JetBrains Mono
- Text: #FFFFFF primary, #B8C4D9 secondary
- CTA button: #6DC4AD (accent) with white text

---

### 6. Success Section
**Story Element:** The Transformation

**Content:**
- Section headline: What changes when you test systematically
- Before/After comparison:
  - Before: "We think users want X" → After: "Data shows 73% of users prefer Y"
  - Before: "The new feature might help" → After: "A/B test showed 35% conversion increase"
  - Before: "Something's slow" → After: "Database query at line 47 causes 2s delay"
- Optional testimonial/quote block

**Shadcn Query:** `before after comparison 2-column with metrics`

**Anti-patterns Avoided:**
- ❌ Generic success icons
- ❌ Vague outcome statements
- ❌ Stock photo testimonials

**Brand Alignment:**
- Background: #E6EAF3 (silver-bg)
- Before column: #FFFFFF with #D0D5E0 left border
- After column: #FFFFFF with #469DBB left border
- Metrics: Manrope 700, large size (36px)
- Check marks: #6DC4AD (teal)

---

### 7. CTA Section
**Story Element:** Direct Call to Action

**Content:**
- Headline: Stop guessing. Start testing.
- Subheadline: Apply scientific rigor to your next decision.
- Primary CTA: Get Started with Hypothesis
- Secondary CTA: Read Documentation

**Shadcn Query:** `CTA banner dark full-width with dual buttons`

**Anti-patterns Avoided:**
- ❌ Light CTA band (lacks urgency)
- ❌ Single centered button
- ❌ Generic gradient background

**Brand Alignment:**
- Background: #121D35 (dark-blue) - DARK BAND continuation
- Headline: #FFFFFF, Manrope 700
- Subheadline: #B8C4D9
- Primary CTA: #6DC4AD bg, white text
- Secondary CTA: Ghost, white text with border
- Spacing: --space-16 (64px) vertical padding

---

### 8. Footer Section

**Content:**
- Think-MCP tool links
- Documentation link
- GitHub link
- Newsletter signup (optional)

**Shadcn Query:** `footer 4-column with newsletter signup`

**Anti-patterns Avoided:**
- ❌ Overly complex mega-footer
- ❌ Social media icons (if not applicable)

**Brand Alignment:**
- Background: #121D35 (continue dark band)
- Text: #FFFFFF primary, #B8C4D9 secondary
- Links hover: #6DC4AD underline
- Divider: 1px #3A4A6B

---

## Shadcn Component Queries Summary

| Section | Query |
|---------|-------|
| Hero | `hero 2-column asymmetric with animated diagram` |
| Stakes | `problem cards 3-column with minimal icons` |
| Features | `feature cards 4-column grid with icon backgrounds` |
| Process | `steps section 3 horizontal numbered with connectors` |
| Demo | `demo panel dark background with tabbed code preview` |
| Success | `before after comparison 2-column with metrics` |
| CTA | `CTA banner dark full-width with dual buttons` |
| Footer | `footer 4-column with newsletter signup` |

---

## Brand Checklist

- [x] Tool accent color: Blue #469DBB used consistently
- [x] Primary CTA: #333333 bg (hero), #6DC4AD bg (dark sections)
- [x] Typography: Manrope headings, Graphik body
- [x] Dark band: #121D35 for Demo, CTA, Footer sections
- [x] Accent lines: 3px height, tool color
- [x] Hover states: translateY + left border reveal
- [x] No glass-morphism
- [x] No generic AI gradients
- [x] No fade-up on everything
- [x] No centered hero layout
- [x] No Heroicons overuse
