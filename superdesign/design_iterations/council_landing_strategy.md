# Landing Page Strategy for Council Tool

**Generated using:** landing-page-architect skill
**Skill test:** Phase 2 validation

---

## Value Proposition

Simulate expert collaboration through diverse AI personas to tackle complex problems from multiple perspectives simultaneously.

## Target Audience

- Technical leads making architectural decisions
- Product managers evaluating trade-offs
- Researchers exploring multi-faceted problems
- Anyone facing decisions that benefit from diverse viewpoints

---

## Page Sections

### 1. Hero Section

**Story Element:** Character + Aspiration

**Content:**
- **Eyebrow:** THINK-MCP TOOLS
- **Headline:** **Debate ideas** with a council of experts
- **Subheadline:** Simulate expert collaboration through diverse AI personas. Get critiques, synthesis, and consensus on complex problems.
- **Primary CTA:** Try Council
- **Secondary CTA:** See Example Session

**Shadcn Query:** `hero 2-column with headline CTA and animated persona cards`

**Anti-patterns Avoided:**
- ❌ Centered hero with two buttons
- ❌ Generic purple gradient
- ❌ Glass-morphism on persona cards

**Brand Alignment:**
- Background: #E6EAF3 (silver-bg)
- Accent color: Purple Light #A070A6 (assigned to council tool)
- Accent line: 3px, 60px width, #A070A6
- Typography: Manrope 800 headline, 300 subheadline
- CTA: #333333 primary, #A070A6 accent

**Visual Element:**
Floating persona cards showing 3-4 expert archetypes (Architect, Pragmatist, Skeptic, Synthesizer) with speech bubble snippets

---

### 2. Stakes Section

**Story Element:** The Problem

**Content:**
- **Headline:** Solo thinking has blind spots
- **Pain Points:**
  1. **External:** You can't be an expert in everything your decisions require
  2. **Internal:** Uncertainty about whether you've considered all angles
  3. **Philosophical:** Important decisions shouldn't be made in isolation

**Shadcn Query:** `problem cards 3-column with icons dark icons`

**Anti-patterns Avoided:**
- ❌ Heroicons on every card
- ❌ Fade-up animation on each
- ❌ Rainbow color per card

**Brand Alignment:**
- Background: #FFFFFF (surface)
- Cards: White with 1px #D0D5E0 border
- Hover: #EBF7F4 background + 3px left #A070A6 border
- Icons: Minimal line style, monochrome

---

### 3. Guide Section (Features)

**Story Element:** Authority + Empathy

**Content:**
- **Intro:** "We know what it's like to wrestle with complex decisions alone."
- **Features:**
  1. **Diverse Personas** - Define experts with unique backgrounds, expertise, and biases
  2. **Structured Stages** - Move through problem-definition → ideation → critique → integration
  3. **Synthesis Engine** - Automatically track consensus, disagreements, and key insights
  4. **Confidence Scoring** - Every contribution comes with explicit confidence levels

**Shadcn Query:** `feature cards 4-column grid with icons minimal`

**Anti-patterns Avoided:**
- ❌ Glass cards
- ❌ 5-column grid (too dense)

**Brand Alignment:**
- Grid: 4 columns, 32px gap
- Icon backgrounds: #EBF7F4 (teal tint)
- Hover: translateY(-4px) + accent border reveal

---

### 4. Process Section

**Story Element:** The Plan

**Content:**
- **Headline:** How Council works
- **Steps:**
  1. **Define your problem** - State the topic and create your expert personas
  2. **Gather perspectives** - Each persona contributes observations, insights, challenges
  3. **Reach synthesis** - Track consensus, resolve disagreements, get recommendations

**Shadcn Query:** `steps section 3 horizontal with numbered icons`

**Anti-patterns Avoided:**
- ❌ More than 3 steps
- ❌ Vertical timeline (too long)

**Brand Alignment:**
- Numbers: Manrope 800, #A070A6 color
- Connector lines: Subtle, 2px #D0D5E0
- Step cards: White surface, consistent spacing

---

### 5. Demo Section (Dark Band)

**Story Element:** Transitional CTA (see it working)

**Content:**
- **Headline:** See Council in action
- **Demo:** Interactive session showing:
  - Topic: "Should we migrate to microservices?"
  - Personas: Architect, Operations Lead, Product Manager
  - Contribution flow with synthesis

**Shadcn Query:** `demo panel dark with tabbed examples code preview`

**Anti-patterns Avoided:**
- ❌ Arbitrary dark color (not #121D35)

**Brand Alignment:**
- Background: #121D35 (dark-blue)
- Panel: #1A2847 (dark-surface)
- Headers: #243356 (dark-surface-alt)
- Syntax highlighting: Teal #6DC4AD for keywords, Pink #EE7BB3 for strings
- Code font: JetBrains Mono

**View Options:**
- Cards view (visual representation)
- JSON view (raw output)

---

### 6. Success Section

**Story Element:** Transformation

**Content:**
- **Headline:** From uncertainty to clarity
- **Before/After:**
  - Before: "Should we do X?" → Analysis paralysis
  - After: "Here's what the experts think, here's where they agree, here's the recommendation"
- **Testimonial placeholder:** [Customer quote about decision quality]

**Shadcn Query:** `before after section 2-column with testimonial`

**Anti-patterns Avoided:**
- ❌ Carousel for testimonials

**Brand Alignment:**
- Before: Muted styling, gray text
- After: Full brand treatment, teal accents
- Quote: Teal quote mark, #EBF7F4 background

---

### 7. CTA Section

**Story Element:** Direct Call to Action

**Content:**
- **Headline:** Make better decisions together
- **Subheadline:** Start your first Council session
- **Primary CTA:** Get Started
- **Transitional CTA:** Read Documentation

**Shadcn Query:** `CTA banner full-width dark with heading and buttons`

**Anti-patterns Avoided:**
- ❌ Multiple CTAs competing

**Brand Alignment:**
- Background: #121D35
- Primary button: #6DC4AD (teal)
- Secondary: Ghost style, white text

---

### 8. Footer

**Content:**
- Links to other think-mcp tools
- Documentation link
- Newsletter signup

**Shadcn Query:** `footer 4-column with links and newsletter`

**Brand Alignment:**
- Background: #121D35 or #FFFFFF
- Links: Muted, teal on hover

---

## Shadcn Component Queries Summary

For Shadcn MCP, run these queries in order:

```
1. hero 2-column asymmetric with CTA and floating cards animation
2. problem cards 3-column with minimal icons
3. feature cards 4-column grid with icon backgrounds
4. steps section 3 horizontal numbered
5. demo panel dark background with tabbed code preview
6. before after comparison 2-column with quote
7. CTA banner dark full-width with dual buttons
8. footer 4-column with newsletter signup
```

---

## Brand Checklist

- [x] Tool accent: Purple Light #A070A6
- [x] Primary CTA: #333333 background
- [x] Secondary CTA: #6DC4AD (teal)
- [x] Dark band: #121D35
- [x] Typography: Manrope + Graphik
- [x] Accent lines: 3px signature element
- [x] No glass-morphism
- [x] No generic purple gradients
- [x] No centered hero + two buttons
- [x] No fade-up on everything
