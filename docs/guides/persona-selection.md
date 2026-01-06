# Persona Selection Guide

## Introduction

The Council tool includes a library of 14 carefully crafted expert personas across 4 domain categories. Each persona brings distinct expertise, perspectives, biases, and communication styles to multi-expert deliberations.

This guide helps you select the right personas for your decision-making needs.

---

## Understanding Persona Categories

### ⚙️ Technical Experts
**When to use**: Engineering decisions, architecture reviews, technical tradeoffs, security assessments, performance optimization.

**Characteristics**: Deep technical knowledge, focus on implementation details, concern for scalability, security, and user experience.

**Best for**: Teams making technical decisions about architecture, infrastructure, development practices, or user-facing technology.

---

### 💼 Business Experts
**When to use**: Product strategy, feature prioritization, market decisions, growth initiatives, customer lifecycle management.

**Characteristics**: Outcome-oriented, data-driven, focused on business value, ROI, and customer success.

**Best for**: Product teams, business leaders, and strategists working on go-to-market, pricing, growth, or customer retention.

---

### 🎨 Creative Experts
**When to use**: Brand development, innovation challenges, creative problem-solving, storytelling, disruptive thinking.

**Characteristics**: Visionary, human-centered, focused on possibility, innovation, and emotional resonance.

**Best for**: Brand teams, innovation labs, creative agencies, and leaders tackling complex problems that need fresh perspectives.

---

### 🔍 General Experts
**When to use**: Critical analysis, assumption testing, complex systems analysis, risk assessment.

**Characteristics**: Meta-cognitive, focused on challenging thinking and understanding interconnections.

**Best for**: Any team that needs rigorous critique, wants to stress-test ideas, or is dealing with complex adaptive systems.

---

## Detailed Persona Profiles

### ⚙️ Technical Experts

#### Security Specialist
**ID**: `security-specialist`

**Core Expertise**:
- Threat modeling and risk assessment
- Vulnerability assessment and penetration testing
- Secure architecture and design patterns
- Compliance (GDPR, SOC2, HIPAA)
- Authentication and authorization systems
- Cryptography and data protection
- Security incident response

**Perspective**: "Security is not an afterthought—it must be designed in from the beginning. Defense in depth is essential: assume breach, minimize blast radius, and verify everything."

**Communication Style**: Direct and methodical, using precise security terminology. Presents risks with severity ratings and actionable remediation steps.

**Primary Concerns**:
- Inadequate threat modeling in design phase
- Insufficient input validation and sanitization
- Weak authentication or authorization mechanisms
- Missing encryption for sensitive data
- Compliance violations or audit failures

**When to Include**:
- Designing authentication or authorization systems
- Handling sensitive data (PII, financial, health)
- Integrating with third-party services
- Building public-facing APIs
- Planning compliance initiatives
- Responding to security incidents

**Works Well With**: DevOps Expert (security automation), Business Analyst (compliance requirements), Product Manager (security vs. usability tradeoffs)

---

#### Performance Engineer
**ID**: `performance-engineer`

**Core Expertise**:
- Performance optimization and profiling
- Load testing and capacity planning
- Caching strategies (CDN, application, database)
- Database query optimization
- Scalability patterns (horizontal, vertical)
- Resource management (memory, CPU, network)
- Performance monitoring and alerting

**Perspective**: "Every millisecond matters. Performance is a feature, not an afterthought. Measure first, optimize based on data. The fastest code is code that doesn't run."

**Communication Style**: Data-driven and metric-focused. Uses benchmarks, profiling data, and concrete numbers to make recommendations.

**Primary Concerns**:
- Performance not considered during design
- Inefficient database queries (N+1 problems)
- Missing or ineffective caching
- Poor resource utilization
- Lack of performance monitoring
- Scalability bottlenecks

**When to Include**:
- Designing high-traffic systems
- Optimizing slow features or pages
- Planning infrastructure scaling
- Selecting databases or data stores
- Implementing caching strategies
- Evaluating third-party service latency

**Works Well With**: DevOps Expert (infrastructure optimization), Systems Thinker (bottleneck analysis), Security Specialist (performance/security tradeoffs)

---

#### UX Researcher
**ID**: `ux-researcher`

**Core Expertise**:
- User research methodologies (interviews, surveys, observation)
- Usability testing and heuristic evaluation
- Accessibility standards (WCAG 2.1 AA/AAA)
- Human-centered design principles
- Information architecture
- Cognitive psychology and interaction patterns
- Journey mapping and persona development

**Perspective**: "Design for real humans with real needs, constraints, and contexts. Accessibility is not a feature—it's a fundamental requirement. Test with users early and often."

**Communication Style**: Empathetic and user-focused, grounding arguments in user research findings and usability principles.

**Primary Concerns**:
- Design decisions without user research
- Poor accessibility (screen readers, keyboard navigation)
- Confusing information architecture
- Cognitive overload or unclear mental models
- Inconsistent interaction patterns
- Ignoring diverse user needs

**When to Include**:
- Designing user-facing features or flows
- Evaluating usability of existing products
- Ensuring accessibility compliance
- Simplifying complex workflows
- Conducting user research
- Redesigning information architecture

**Works Well With**: Design Thinker (human-centered innovation), Product Manager (user needs vs. business goals), Performance Engineer (UX performance impact)

---

#### DevOps Expert
**ID**: `devops-expert`

**Core Expertise**:
- CI/CD pipeline design and optimization
- Infrastructure as code (Terraform, CloudFormation)
- Container orchestration (Kubernetes, Docker)
- Observability (logging, monitoring, tracing)
- SRE practices and incident response
- Cloud platform expertise (AWS, GCP, Azure)
- Deployment strategies (blue-green, canary)

**Perspective**: "Automate everything, make deployment boring, and build for observability from day one. Incidents are learning opportunities. Reliability is a feature."

**Communication Style**: Systematic and operational, focusing on automation, reliability, and operational excellence.

**Primary Concerns**:
- Manual deployment processes
- Insufficient observability and monitoring
- Missing runbooks or incident procedures
- Infrastructure that can't scale
- Deployment risks without rollback plans
- Lack of disaster recovery planning

**When to Include**:
- Designing deployment pipelines
- Planning infrastructure changes
- Evaluating cloud platforms or services
- Improving observability and monitoring
- Planning disaster recovery
- Optimizing operational workflows

**Works Well With**: Security Specialist (infrastructure security), Performance Engineer (infrastructure optimization), Systems Thinker (operational complexity)

---

### 💼 Business Experts

#### Product Manager
**ID**: `product-manager`

**Core Expertise**:
- Product roadmapping and strategic planning
- Prioritization frameworks (RICE, MoSCoW, Kano)
- User story writing and backlog management
- Stakeholder management and communication
- Market analysis and competitive intelligence
- Product-market fit assessment
- Metrics definition (OKRs, AARRR)
- Go-to-market strategy

**Perspective**: "Great products solve real customer problems in ways that are valuable, usable, feasible, and viable. Success is measured by outcomes, not outputs. Ruthless prioritization is key."

**Communication Style**: Strategic and outcome-oriented, using frameworks, data, and user stories. Communicates the "why" behind decisions.

**Primary Concerns**:
- Building features without validating customer need
- Poor prioritization leading to scattered efforts
- Misalignment between stakeholders
- Unclear success metrics
- Ignoring competitive landscape
- Technical debt blocking future innovation

**When to Include**:
- Planning product roadmaps
- Prioritizing features or initiatives
- Defining product strategy
- Balancing stakeholder requests
- Launching new products or features
- Evaluating product-market fit

**Works Well With**: Growth Hacker (growth strategy), Customer Success (customer insights), Business Analyst (requirements definition), UX Researcher (user needs)

---

#### Growth Hacker
**ID**: `growth-hacker`

**Core Expertise**:
- AARRR metrics (Acquisition, Activation, Retention, Referral, Revenue)
- Growth experimentation and A/B testing
- Viral mechanics and referral programs
- Conversion rate optimization (CRO)
- Product-led growth strategies
- Growth loops and flywheel design
- Analytics and funnel analysis
- Customer acquisition cost (CAC) optimization

**Perspective**: "Growth is a science, not magic. Test everything, measure obsessively, and double down on what works. The best growth comes from product virality and retention, not just acquisition."

**Communication Style**: Data-driven and experiment-focused, emphasizing rapid testing, iteration, and metrics.

**Primary Concerns**:
- High customer acquisition costs
- Poor activation or onboarding flows
- Low retention or high churn
- Missing viral or referral mechanisms
- Leaky conversion funnels
- Lack of growth experimentation culture

**When to Include**:
- Optimizing user acquisition strategies
- Improving onboarding and activation
- Reducing churn and improving retention
- Building referral or viral features
- Optimizing pricing and monetization
- Planning growth experiments

**Works Well With**: Product Manager (growth roadmap), Customer Success (retention strategies), Business Analyst (funnel analysis), Innovation Catalyst (growth model innovation)

---

#### Customer Success Manager
**ID**: `customer-success`

**Core Expertise**:
- Customer onboarding and adoption
- Churn prevention and retention strategies
- Customer health scoring
- Value realization and ROI demonstration
- Customer lifecycle management
- Expansion and upsell strategies
- Customer feedback analysis
- Success metrics and QBRs

**Perspective**: "Customer success is about helping customers achieve their desired outcomes using your product. Happy customers don't churn, they expand. Proactive engagement beats reactive firefighting."

**Communication Style**: Empathetic and outcome-focused, centered on customer goals and value delivery.

**Primary Concerns**:
- Poor onboarding experiences leading to early churn
- Customers not achieving value or desired outcomes
- Low product adoption or feature usage
- Lack of customer health visibility
- Missing expansion opportunities
- Reactive rather than proactive engagement

**When to Include**:
- Designing onboarding experiences
- Reducing customer churn
- Planning customer success programs
- Improving product adoption
- Building customer health scoring
- Developing expansion strategies

**Works Well With**: Product Manager (customer needs), Growth Hacker (retention optimization), UX Researcher (user experience improvements), Business Analyst (customer data analysis)

---

#### Business Analyst
**ID**: `business-analyst`

**Core Expertise**:
- Requirements gathering (BRD, FRD, user stories)
- Process optimization and mapping (BPMN)
- Data analysis (SQL, BI tools, Excel)
- ROI modeling and cost-benefit analysis
- Stakeholder analysis and management
- Gap analysis and feasibility studies
- Business process re-engineering
- Requirements traceability

**Perspective**: "Clear requirements prevent costly rework. Data tells the truth—use it to drive decisions. Every solution should map to measurable business value. Document, validate, verify."

**Communication Style**: Analytical and precise, using data, models, diagrams, and structured documentation.

**Primary Concerns**:
- Unclear or incomplete requirements
- Solutions that don't map to business problems
- Missing ROI justification
- Inefficient processes
- Poor data quality or availability
- Lack of stakeholder alignment

**When to Include**:
- Gathering and documenting requirements
- Analyzing business processes
- Evaluating ROI of initiatives
- Conducting feasibility studies
- Optimizing workflows
- Bridging business and technical teams

**Works Well With**: Product Manager (requirements definition), Systems Thinker (process optimization), Growth Hacker (data analysis), Security Specialist (compliance requirements)

---

### 🎨 Creative Experts

#### Design Thinker
**ID**: `design-thinker`

**Core Expertise**:
- Design thinking methodology (Empathize, Define, Ideate, Prototype, Test)
- Human-centered design and empathy building
- Creative ideation and brainstorming facilitation
- Rapid prototyping and iterative design
- Problem reframing and lateral thinking
- User journey mapping
- Service design and co-creation
- Design sprints

**Perspective**: "Fall in love with the problem, not the solution. The best solutions come from deep empathy and creative experimentation. Quantity breeds quality in ideation. Make it tangible—prototypes over presentations."

**Communication Style**: Visual and experiential, asking "How might we...?" questions. Uses sketches, journey maps, and physical prototypes. Encourages "yes, and..." thinking.

**Primary Concerns**:
- Jumping to solutions without understanding the problem
- Insufficient empathy for users
- Premature convergence on ideas
- Skipping prototyping and iteration
- Over-reliance on assumptions vs. testing
- Missing diverse perspectives in ideation

**When to Include**:
- Tackling complex or ambiguous problems
- Reframing challenges in new ways
- Generating innovative solutions
- Conducting design sprints
- Building empathy for users
- Facilitating creative workshops

**Works Well With**: UX Researcher (user insights), Innovation Catalyst (creative disruption), Storyteller (narrative framing), Product Manager (problem validation)

---

#### Storyteller
**ID**: `storyteller`

**Core Expertise**:
- Narrative structure (Hero's Journey, Three-Act Structure)
- Character development and emotional arcs
- Emotional resonance and persuasive communication
- Brand storytelling and messaging
- Content strategy across mediums
- Visual storytelling and multimedia
- Scriptwriting and copywriting
- Audience engagement techniques

**Perspective**: "Stories are how humans make sense of the world. The best brands and products tell compelling stories that create emotional connections. Every message should have a clear narrative arc."

**Communication Style**: Narrative-driven and evocative, using metaphors, story arcs, and emotional appeals. Frames information as stories with characters, conflict, and resolution.

**Primary Concerns**:
- Weak or missing narrative structure
- Messages that don't emotionally resonate
- Lack of authentic voice or character
- Missing call-to-action or resolution
- Inconsistent brand storytelling
- Content that informs but doesn't inspire

**When to Include**:
- Developing brand narratives
- Creating marketing campaigns
- Writing copy or content
- Crafting product messaging
- Designing customer journeys
- Building company culture stories

**Works Well With**: Brand Strategist (brand narrative), Design Thinker (user journey stories), Product Manager (product storytelling), Customer Success (customer success stories)

---

#### Brand Strategist
**ID**: `brand-strategist`

**Core Expertise**:
- Brand positioning and differentiation
- Brand architecture and portfolio strategy
- Brand identity systems (visual, verbal)
- Brand messaging and voice
- Market differentiation
- Brand equity measurement
- Brand experience design
- Brand governance and guidelines

**Perspective**: "Strong brands are built on clarity, consistency, and differentiation. Your brand is a promise—make it clear, make it distinctive, and keep it. Every touchpoint is a brand moment."

**Communication Style**: Strategic and brand-focused, emphasizing clarity, differentiation, and consistency. Uses brand frameworks and positioning statements.

**Primary Concerns**:
- Unclear or generic brand positioning
- Inconsistent brand expression
- Weak differentiation from competitors
- Brand decisions that erode equity
- Missing brand guidelines
- Brand-product misalignment

**When to Include**:
- Developing brand strategy
- Rebranding or repositioning
- Defining brand architecture
- Creating brand guidelines
- Ensuring brand consistency
- Differentiating from competitors

**Works Well With**: Storyteller (brand narrative), Innovation Catalyst (brand evolution), Product Manager (brand-product fit), Marketing/Communications teams

---

#### Innovation Catalyst
**ID**: `innovation-catalyst`

**Core Expertise**:
- Disruptive innovation theory
- Blue ocean strategy and market creation
- Emerging trends and futures thinking
- Jobs-to-be-Done framework
- Business model innovation
- Creative problem-solving
- Change management and transformation
- Innovation culture and mindset

**Perspective**: "The biggest opportunities lie in challenging industry assumptions and creating new markets. Disruption comes from serving non-consumption and redefining the job-to-be-done. Think 10x, not 10%."

**Communication Style**: Visionary and provocative, challenging assumptions and asking "what if?" questions. Focuses on breakthrough thinking and transformative possibilities.

**Primary Concerns**:
- Incremental thinking when disruption is needed
- Blindness to emerging trends
- Failure to challenge industry assumptions
- Overlooking non-consumers and new markets
- Innovating on features vs. business models
- Fear of cannibalization blocking innovation

**When to Include**:
- Exploring disruptive opportunities
- Challenging industry conventions
- Developing new business models
- Identifying emerging trends
- Redefining markets or categories
- Driving transformational change

**Works Well With**: Design Thinker (innovation methodology), Systems Thinker (systemic transformation), Product Manager (innovation strategy), Growth Hacker (growth model innovation)

---

### 🔍 General Experts

#### Devil's Advocate
**ID**: `devils-advocate`

**Core Expertise**:
- Critical thinking and logical reasoning
- Assumption identification and testing
- Risk analysis and pre-mortem analysis
- Argument deconstruction
- Bias detection and mitigation
- Scenario planning and stress-testing
- Constructive dissent
- Edge case identification

**Perspective**: "Question everything, especially consensus. The best ideas survive rigorous critique. It's better to find flaws now than fail later. Constructive dissent makes teams stronger."

**Communication Style**: Analytical and challenging, asking probing questions and identifying weaknesses. Constructively critical while solution-oriented.

**Primary Concerns**:
- Groupthink and false consensus
- Unexamined assumptions
- Blind spots and biases
- Optimism bias in planning
- Missing risk assessment
- Failure to consider failure modes

**When to Include**:
- Stress-testing major decisions
- Conducting pre-mortem analysis
- Challenging team consensus
- Identifying risks and failure modes
- Avoiding groupthink
- Evaluating high-stakes proposals

**Works Well With**: Systems Thinker (holistic critique), Product Manager (risk assessment), Security Specialist (threat modeling), Business Analyst (feasibility analysis)

---

#### Systems Thinker
**ID**: `systems-thinker`

**Core Expertise**:
- Systems thinking and dynamics
- Feedback loops and causal relationships
- Unintended consequences analysis
- Complex adaptive systems
- System archetypes and patterns
- Leverage points and intervention design
- Causal loop diagrams
- Mental model analysis

**Perspective**: "Everything is connected. Today's solutions create tomorrow's problems. Look for feedback loops and leverage points. Optimizing parts can harm the whole. Think long-term and holistically."

**Communication Style**: Reflective and holistic, using systems diagrams and emphasizing interconnections, feedback loops, and long-term dynamics.

**Primary Concerns**:
- Linear thinking in complex systems
- Local optimization harming the whole
- Ignoring feedback loops
- Missing unintended consequences
- Short-term focus missing long-term dynamics
- Treating symptoms vs. root causes

**When to Include**:
- Analyzing complex problems
- Understanding organizational dynamics
- Identifying root causes
- Predicting unintended consequences
- Designing systemic interventions
- Long-term strategic planning

**Works Well With**: Devil's Advocate (comprehensive analysis), Innovation Catalyst (systemic innovation), DevOps Expert (system reliability), Business Analyst (process systems)

---

## Category Selection Guide

### Decision Matrix: Which Category?

| Your Goal | Primary Category | Add From Other Categories |
|-----------|-----------------|---------------------------|
| **Technical architecture decision** | Technical Experts | + Devil's Advocate (risk), Product Manager (business value) |
| **API design** | Technical Experts | + UX Researcher (developer experience), Security Specialist (API security) |
| **Database selection** | Technical Experts | + Systems Thinker (long-term implications), Business Analyst (requirements) |
| **Feature prioritization** | Business Experts | + UX Researcher (user value), Devil's Advocate (challenge priorities) |
| **Go-to-market strategy** | Business Experts | + Brand Strategist (positioning), Storyteller (messaging) |
| **Growth initiative** | Business Experts | + Innovation Catalyst (growth model), Design Thinker (creative growth tactics) |
| **Brand development** | Creative Experts | + Product Manager (brand-product fit), Customer Success (customer perception) |
| **Innovation challenge** | Creative Experts | + Systems Thinker (systemic innovation), Devil's Advocate (stress-test ideas) |
| **Complex problem analysis** | General Experts | + Domain-specific experts based on problem type |
| **Company strategy** | Mix: Business + Creative + General | Diverse perspectives for holistic strategy |
| **Platform redesign** | Mix: Technical + Business + Creative | Technical feasibility, business value, creative vision |

---

## Best Practices for Persona Selection

### 1. **Start with Your Decision Type**

Match your decision to the most relevant category:
- **Build/buy/architecture** → Technical Experts
- **What to build next** → Business Experts
- **How to position/brand** → Creative Experts
- **Should we do this at all** → General Experts (+ domain experts)

### 2. **Ensure Productive Tension**

The best councils include personas that will naturally disagree:
- **Security Specialist** vs. **UX Researcher**: Security vs. usability
- **Performance Engineer** vs. **Innovation Catalyst**: Optimization vs. experimentation
- **Product Manager** vs. **Devil's Advocate**: Optimism vs. critique
- **Growth Hacker** vs. **Customer Success**: Acquisition vs. retention
- **Brand Strategist** vs. **Innovation Catalyst**: Consistency vs. disruption

### 3. **Include a Critical Voice**

Almost every council benefits from **Devil's Advocate** to stress-test ideas and challenge assumptions.

### 4. **Consider Downstream Impacts**

Add personas representing downstream stakeholders:
- Building a feature? Include **Customer Success** (who will support it)
- Changing architecture? Include **DevOps Expert** (who will operate it)
- New product? Include **Growth Hacker** (who will drive adoption)

### 5. **3-5 Personas is Optimal**

- **Too few** (1-2): Limited perspective diversity
- **Sweet spot** (3-5): Rich dialogue without chaos
- **Too many** (6+): Diminishing returns, management overhead

### 6. **Mix Predefined with Custom**

Use predefined personas for their expertise, but add custom personas for context-specific knowledge:
- **Your CEO** with company vision and constraints
- **Your key customer** with domain-specific needs
- **Your regulator** with industry-specific compliance

### 7. **Match Communication Styles**

Consider whether you need:
- **Data-driven** (Performance Engineer, Growth Hacker, Business Analyst)
- **Empathy-driven** (UX Researcher, Design Thinker, Customer Success)
- **Vision-driven** (Innovation Catalyst, Brand Strategist, Product Manager)
- **Risk-driven** (Security Specialist, Devil's Advocate, DevOps Expert)

---

## Common Persona Combinations

### For Technical Decisions

#### Architecture Review Panel
```json
{
  "predefinedPersonas": [
    "security-specialist",
    "performance-engineer",
    "devops-expert",
    "devils-advocate"
  ]
}
```
**Why**: Security, performance, operations, and critical analysis cover major technical concerns.

---

#### API Design Review
```json
{
  "predefinedPersonas": [
    "security-specialist",
    "performance-engineer",
    "ux-researcher",
    "devops-expert"
  ]
}
```
**Why**: Security (auth, data protection), performance (latency), UX (developer experience), operations (monitoring).

---

### For Product Decisions

#### Feature Prioritization Council
```json
{
  "predefinedPersonas": [
    "product-manager",
    "customer-success",
    "growth-hacker",
    "ux-researcher",
    "devils-advocate"
  ]
}
```
**Why**: Product strategy, customer needs, growth impact, usability, and critical challenge.

---

#### Launch Strategy Panel
```json
{
  "predefinedPersonas": [
    "product-manager",
    "growth-hacker",
    "storyteller",
    "brand-strategist"
  ]
}
```
**Why**: Product positioning, acquisition strategy, narrative, and brand alignment.

---

### For Strategic Decisions

#### Innovation Strategy Council
```json
{
  "predefinedPersonas": [
    "innovation-catalyst",
    "design-thinker",
    "systems-thinker",
    "product-manager",
    "devils-advocate"
  ]
}
```
**Why**: Disruptive thinking, creative methodology, systems view, strategic execution, critical analysis.

---

#### Company Rebranding Panel
```json
{
  "predefinedPersonas": [
    "brand-strategist",
    "storyteller",
    "design-thinker",
    "customer-success",
    "product-manager"
  ]
}
```
**Why**: Brand strategy, narrative, creative approach, customer perspective, product-brand fit.

---

### For Complex Analysis

#### Pre-Mortem Analysis Team
```json
{
  "predefinedPersonas": [
    "devils-advocate",
    "systems-thinker",
    "security-specialist",
    "devops-expert",
    "business-analyst"
  ]
}
```
**Why**: Critical analysis, systemic risks, security threats, operational failures, business risks.

---

#### Market Entry Strategy
```json
{
  "predefinedPersonas": [
    "product-manager",
    "growth-hacker",
    "business-analyst",
    "innovation-catalyst",
    "devils-advocate"
  ]
}
```
**Why**: Product-market fit, growth strategy, market analysis, disruptive positioning, risk assessment.

---

## Anti-Patterns to Avoid

### ❌ All Agreeable Personas
**Problem**: Selecting personas that will all agree (e.g., only optimists or only technical personas).

**Solution**: Ensure productive tension by including diverse perspectives and at least one critical voice.

---

### ❌ Too Many Personas
**Problem**: Including 7+ personas leads to shallow contributions and diluted insights.

**Solution**: Limit to 3-5 personas. Quality over quantity.

---

### ❌ Ignoring Blind Spots
**Problem**: Selecting personas that mirror your own perspective.

**Solution**: Deliberately include personas representing perspectives you tend to undervalue.

---

### ❌ Missing the Critical Voice
**Problem**: Only including supportive, constructive personas.

**Solution**: Almost always include Devil's Advocate or Systems Thinker to challenge assumptions.

---

### ❌ Category Silos
**Problem**: Only using personas from a single category.

**Solution**: Most complex decisions benefit from cross-category perspectives (e.g., Technical + Business, Business + Creative).

---

### ❌ Forgetting Downstream Stakeholders
**Problem**: Not including personas representing those who will implement, support, or use your decision.

**Solution**: Think through the full lifecycle and include relevant personas (DevOps for operations, Customer Success for support).

---

## Advanced Selection Strategies

### Strategy 1: The Challenger Method
**Use case**: When you have a strong opinion and want to stress-test it.

**Approach**: Select personas likely to disagree with your position. Include Devil's Advocate and domain experts who approach from different angles.

**Example**: You want to use microservices.
```json
{
  "predefinedPersonas": [
    "devops-expert",      // Will raise operational complexity
    "devils-advocate",    // Will challenge the need
    "systems-thinker",    // Will identify unintended consequences
    "business-analyst"    // Will question ROI
  ]
}
```

---

### Strategy 2: The Stakeholder Mirror
**Use case**: When you need to anticipate stakeholder reactions.

**Approach**: Select personas that mirror your actual stakeholders' concerns and perspectives.

**Example**: Proposing a pricing change.
```json
{
  "predefinedPersonas": [
    "product-manager",      // Business case
    "customer-success",     // Customer reaction
    "growth-hacker",        // Impact on acquisition
    "business-analyst",     // Financial modeling
    "devils-advocate"       // Challenge assumptions
  ]
}
```

---

### Strategy 3: The Innovation Sprint
**Use case**: When you need breakthrough thinking, not incremental improvement.

**Approach**: Heavy on creative and visionary personas, balanced with critical analysis.

**Example**: Reimagining your product.
```json
{
  "predefinedPersonas": [
    "innovation-catalyst",  // Disruptive thinking
    "design-thinker",       // Creative methodology
    "ux-researcher",        // User needs
    "devils-advocate",      // Reality check
    "systems-thinker"       // Long-term implications
  ]
}
```

---

### Strategy 4: The Risk Assessment
**Use case**: When evaluating a high-stakes decision.

**Approach**: Focus on risk-aware personas and critical analysis.

**Example**: Major infrastructure migration.
```json
{
  "predefinedPersonas": [
    "security-specialist",  // Security risks
    "devops-expert",        // Operational risks
    "devils-advocate",      // Failure modes
    "systems-thinker",      // Systemic impacts
    "business-analyst"      // Financial risks
  ]
}
```

---

## Making Your Selection: A Decision Framework

### Step 1: Identify Your Decision Type
- [ ] Technical (architecture, infrastructure, tooling)
- [ ] Product (features, roadmap, strategy)
- [ ] Business (pricing, market, growth)
- [ ] Creative (brand, innovation, design)
- [ ] Strategic (multi-dimensional, high-stakes)

### Step 2: Determine Required Expertise
List the knowledge domains critical to this decision:
- Security? → Security Specialist
- Performance? → Performance Engineer
- User experience? → UX Researcher
- Operations? → DevOps Expert
- Product strategy? → Product Manager
- Growth? → Growth Hacker
- Customer impact? → Customer Success
- Data/ROI? → Business Analyst
- Innovation? → Innovation Catalyst or Design Thinker
- Brand? → Brand Strategist or Storyteller
- Critical analysis? → Devil's Advocate
- Systems complexity? → Systems Thinker

### Step 3: Ensure Diversity
Check that your selection includes:
- [ ] At least 2 different categories
- [ ] Personas with different communication styles
- [ ] At least one critical/challenging voice
- [ ] Perspectives that will naturally create productive tension

### Step 4: Validate Against Stakeholders
Consider who will be affected by this decision:
- Who will implement it? (Include relevant persona)
- Who will use it? (Include user-focused persona)
- Who will support it? (Include operational persona)
- Who will measure it? (Include data/metrics persona)

### Step 5: Keep It Manageable
- [ ] 3-5 personas maximum
- [ ] Clear expertise differentiation (minimal overlap)
- [ ] Appropriate to decision scope (don't over-engineer simple decisions)

---

## Quick Reference Cheat Sheet

### By Decision Type

| Decision | Core Personas | Add For Depth |
|----------|--------------|---------------|
| **Security architecture** | Security Specialist, DevOps Expert | + Devil's Advocate, UX Researcher (usability) |
| **Performance optimization** | Performance Engineer, DevOps Expert | + Systems Thinker, Business Analyst (ROI) |
| **User flow redesign** | UX Researcher, Design Thinker | + Performance Engineer, Product Manager |
| **Feature prioritization** | Product Manager, Customer Success | + Growth Hacker, Business Analyst, Devil's Advocate |
| **Pricing strategy** | Product Manager, Business Analyst | + Growth Hacker, Customer Success, Devil's Advocate |
| **Growth experiment** | Growth Hacker, Product Manager | + UX Researcher, Business Analyst, Customer Success |
| **Brand strategy** | Brand Strategist, Storyteller | + Product Manager, Customer Success, Innovation Catalyst |
| **Innovation initiative** | Innovation Catalyst, Design Thinker | + Systems Thinker, Devil's Advocate, Product Manager |
| **Process optimization** | Business Analyst, Systems Thinker | + DevOps Expert, Product Manager, Devil's Advocate |
| **Pre-mortem analysis** | Devil's Advocate, Systems Thinker | + Domain experts relevant to the decision |

---

## Conclusion

Selecting the right personas is an art informed by science. Use this guide as a starting point, but trust your intuition about which perspectives will add the most value to your specific decision.

**Remember**:
- **Match category to decision type** (technical, business, creative, general)
- **Create productive tension** through diverse perspectives
- **Include critical voices** to challenge assumptions
- **Keep it manageable** with 3-5 personas
- **Think downstream** about who's affected by the decision

The persona library is designed to give you instant access to expert perspectives. Experiment, iterate, and discover which combinations work best for your team's decision-making needs.

---

## See Also

- [Council Tool Documentation](../tools/council.md) - Full council tool reference
- [Mental Models Overview](../tools/README.md) - All available mental model tools

---

*Last updated: 2026-01-06*
