# Add Zod Schema Validation

## Overview
Replace manual validation in all tool servers with Zod schemas. Zod is already a dependency (v3.25+) but not used for runtime validation. Each server has repetitive validateXData() methods that manually check types.


## Rationale

Zod is already installed as a dependency in package.json but completely unused. The manual validation pattern in every server (e.g., `if (!data.modelName || typeof data.modelName !== 'string')`) is verbose and error-prone. The infrastructure is ready - just need to use it.

---
*This spec was created from ideation and is pending detailed specification.*
