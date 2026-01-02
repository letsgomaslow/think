# Landing Page Strategy for Map Tool

## Value Proposition
**Think in pictures, not just words.** Map helps you see patterns, relationships, and gaps that are invisible in linear text by creating and manipulating visual diagrams.

## Target Audience
- System architects designing complex architectures
- Developers debugging with visual state diagrams
- Product managers mapping user journeys
- Teams who need to communicate complexity visually
- Anyone who thinks better when they can see structure

## Tool Accent Color
**Purple #401877** - Premium, visual, creative thinking

---

## Page Sections

### 1. Hero Section
**Story Element:** Character + Aspiration

**Content:**
- Eyebrow: THINK-MCP TOOLS
- Headline: **See** your thinking
- Subheadline: Transform invisible complexity into visible clarity. Create flowcharts, concept maps, and diagrams that reveal what text can't show.
- Primary CTA: Try Map Free
- Secondary CTA: Watch Demo
- Visual: Animated-beam component showing nodes connecting with flowing light beams (demonstrates the tool immediately)

**Shadcn Query:** `animated-beam multiple inputs outputs` + `interactive-grid-pattern`
**Anti-patterns Avoided:**
- No centered hero layout
- No generic purple gradients (#a855f7)
- No emoji icons

**Brand Alignment:**
- Layout: 2-column grid with animated diagram on right
- Background: #E6EAF3 (silver-bg) with interactive-grid-pattern overlay
- Accent line: 3px height, 60px width, #401877 (Map purple)
- Typography: Manrope 800 bold "See" + Manrope 300 light "your thinking"
- Primary CTA: #333333 bg, white text
- Secondary CTA: Ghost style, #401877 text

**Icon Components:**
- @animate-ui `icons-eye` for "See"
- @animate-ui `icons-link` for connections

---

### 2. Stakes Section
**Story Element:** The Problem (External, Internal, Philosophical)

**Content:**
- Section headline: Complexity you can't communicate kills projects
- Pain points:
  1. **Invisible architecture** (External) - The system in your head can't be shared
  2. **Lost in text** (Internal) - Documentation nobody reads because it's walls of words
  3. **Decisions without the full picture** (Philosophical) - Teams build the wrong thing because they couldn't see the whole

**Shadcn Query:** `feature cards 3-column with minimal icons`
**Anti-patterns Avoided:**
- No glass-morphism cards
- No fade-up on each card
- No Heroicons everywhere

**Brand Alignment:**
- Background: #FFFFFF (surface)
- Card borders: 1px #D0D5E0
- Hover state: translateY(-4px) + 3px left border #401877
- Icon style: @animate-ui minimal line icons (`icons-eye`, `icons-list`, `icons-x`)
- Text: #333333 primary, #A5A5A5 secondary

---

### 3. Guide Section (Features)
**Story Element:** Authority + Empathy

**Content:**
- Empathy statement: "We know what it's like to have a clear picture in your head that you can't get out. To explain a system five times because the diagram in the docs is outdated."
- Authority features (Diagram Types):
  1. **Flowcharts** - Processes, algorithms, decision paths
  2. **Concept Maps** - Relationships between ideas
  3. **State Diagrams** - System states and transitions
  4. **Tree Diagrams** - Hierarchies and decomposition
  5. **Custom Graphs** - Networks and connections

**Shadcn Query:** `bento grid layout with mixed card sizes`
**Anti-patterns Avoided:**
- No same-size cards for everything
- No generic feature list layout
- No Inter/Arial fonts

**Brand Alignment:**
- Background: #E6EAF3 (silver-bg)
- Bento layout: Large card for flowchart (main use case), smaller for others
- Card surface: #FFFFFF
- Icon backgrounds: #F3E8FF (purple tint) circles
- Typography: Manrope 600 for titles, Graphik 400 for descriptions

**Icon Components:**
- @animate-ui `icons-play` for flowcharts (flow)
- @animate-ui `icons-link` for concept maps
- @animate-ui `icons-cog` for state diagrams
- @animate-ui `icons-list` for tree diagrams
- @animate-ui `icons-star` for custom

---

### 4. Process Section (Plan)
**Story Element:** The Path (3 steps max)

**Content:**
- Section headline: From thought to visual in three moves
- Steps:
  1. **Create** - Start with nodes and edges, build your structure
  2. **Transform** - Regroup, recolor, resize to see differently
  3. **Observe** - Record insights and hypotheses from what you see

**Shadcn Query:** `steps section 3 horizontal numbered with connectors` + `animated-beam` for connectors
**Anti-patterns Avoided:**
- No more than 3 steps
- No complex iconography
- No vertical timeline (horizontal shows flow)

**Brand Alignment:**
- Background: #FFFFFF (surface)
- Step numbers: 48px circles, #401877 border, #FFFFFF fill
- Connector lines: Animated-beam style with #401877 glow
- Active/hover: #401877 filled circle
- Typography: Manrope 700 step titles, Graphik 400 descriptions

---

### 5. Demo Section (Transitional CTA)
**Story Element:** Show the tool in action

**Content:**
- Context: "See Map build a real diagram"
- Example: System architecture visualization
  - Tab 1: **Flowchart** - User authentication flow
  - Tab 2: **Concept Map** - Microservices dependencies
  - Tab 3: **State Diagram** - Order lifecycle states
- Micro-CTA: "Try this example"

**Shadcn Query:** `tabs with code preview` + `animated-grid-pattern background`
**Anti-patterns Avoided:**
- No light demo on light background
- No fake terminal with blinking cursor
- No auto-playing animation

**Brand Alignment:**
- Background: #121D35 (dark-blue) - DARK BAND
- Surface: #1A2847 (dark-surface) for demo panel
- Tab backgrounds: #243356 (dark-surface-alt)
- Active tab: #401877 left border (Map purple)
- Code font: JetBrains Mono
- Text: #FFFFFF primary, #B8C4D9 secondary
- CTA button: #6DC4AD (accent) with white text

---

### 6. Success Section
**Story Element:** The Transformation

**Content:**
- Section headline: What changes when you think visually
- Before/After comparison:
  - Before: "The API calls the auth service which validates tokens and..." (wall of text)
  - After: Beautiful flowchart with clear nodes and connections
  - Before: "We have 12 microservices with complex dependencies..."
  - After: Concept map showing all relationships at a glance
  - Before: "The order can be pending, paid, shipped, or..."
  - After: State diagram with clear transitions

**Shadcn Query:** `before after comparison 2-column with image-comparison slider`
**Anti-patterns Avoided:**
- No generic success icons
- No vague outcome statements
- No stock images

**Brand Alignment:**
- Background: #E6EAF3 (silver-bg)
- Before column: #FFFFFF with #D0D5E0 left border, muted styling
- After column: #FFFFFF with #401877 left border, full color
- Visual: @motion-primitives `image-comparison` slider
- Check marks: #6DC4AD (teal)

---

### 7. CTA Section
**Story Element:** Direct Call to Action

**Content:**
- Headline: Stop describing. Start showing.
- Subheadline: Transform your next complex idea into a clear visual.
- Primary CTA: Try Map Free
- Secondary CTA: Read Documentation

**Shadcn Query:** `CTA banner dark full-width with dual buttons`
**Anti-patterns Avoided:**
- No light CTA band
- No single centered button
- No generic gradient

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
- Other think-mcp tools

**Shadcn Query:** `footer 4-column minimal`
**Anti-patterns Avoided:**
- No overly complex mega-footer
- No social media icons (if not applicable)

**Brand Alignment:**
- Background: #121D35 (continue dark band)
- Text: #FFFFFF primary, #B8C4D9 secondary
- Links hover: #6DC4AD underline
- Divider: 1px #3A4A6B

---

## Shadcn Component Queries Summary

| Section | Query | Registry |
|---------|-------|----------|
| Hero Visual | `animated-beam-multiple-inputs` | @magicui |
| Hero Background | `interactive-grid-pattern` | @magicui |
| Stakes Cards | `feature cards 3-column` | @shadcn |
| Features | `bento grid` | @magicui |
| Process Connectors | `animated-beam` | @magicui |
| Demo Background | `animated-grid-pattern` | @magicui |
| Demo Tabs | `tabs` | @shadcn |
| Success | `image-comparison` | @motion-primitives |
| CTA | `CTA banner dark` | custom |

---

## Icon Components (NO EMOJIS)

| Purpose | Component | Registry |
|---------|-----------|----------|
| Vision/See | `icons-eye` | @animate-ui |
| Connections | `icons-link` | @animate-ui |
| Flow/Process | `icons-play` | @animate-ui |
| Settings/State | `icons-cog` | @animate-ui |
| Hierarchy | `icons-list` | @animate-ui |
| Highlight | `icons-star` | @animate-ui |
| Add node | `icons-plus` | @animate-ui |
| Remove | `icons-x` | @animate-ui |

---

## Brand Checklist

- [x] Tool accent color: Purple #401877 used consistently
- [x] Primary CTA: #333333 bg (hero), #6DC4AD bg (dark sections)
- [x] Typography: Manrope headings, Graphik body
- [x] Dark band: #121D35 for Demo, CTA, Footer sections
- [x] Accent lines: 3px height, #401877
- [x] Hover states: translateY + left border reveal
- [x] No glass-morphism
- [x] No generic AI gradients (#a855f7, #8b5cf6)
- [x] No fade-up on everything
- [x] No centered hero layout
- [x] **No emoji icons** - @animate-ui components only
- [x] Interactive demo with tabbed examples
- [x] Before/After transformation section
- [x] Animated-beam for hero (page IS a diagram)
