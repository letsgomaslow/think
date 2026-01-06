# Extended Visual Reasoning (Map Tool)

Expand the map tool to support additional diagram types: Sequence Diagrams, State Machine Diagrams, Entity-Relationship Diagrams, Mind Maps, and System Context Diagrams. Output in Mermaid format for easy rendering.

## Rationale
Market gap (gap-6): Visual/spatial reasoning tools absent from MCP ecosystem. Different problem types need different visualizations. Mermaid format enables rendering in many tools. Addresses user goal of spatial reasoning enhancement.

## User Stories
- As an architect, I want sequence diagrams so that I can visualize component interactions
- As a state machine designer, I want state diagrams so that I can model system behavior
- As a brainstormer, I want mind maps so that I can organize ideas visually

## Acceptance Criteria
- [ ] 5 new diagram types supported
- [ ] Mermaid-compatible output for all diagram types
- [ ] Clear input schema for each diagram type
- [ ] Preview capability in playground (feature-2)
- [ ] Documentation with diagram type selection guidance
- [ ] Examples for each diagram type in documentation
