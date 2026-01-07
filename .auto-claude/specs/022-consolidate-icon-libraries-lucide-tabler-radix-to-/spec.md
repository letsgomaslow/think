# Consolidate icon libraries (lucide, tabler, radix) to single library

## Overview
The web app uses THREE separate icon libraries: lucide-react, @tabler/icons-react, and @radix-ui/react-icons. Found usage across 45+ files. Each library adds significant bundle weight and they often contain duplicate icon designs.


## Rationale

Using multiple icon libraries is a common bundle bloat issue. Each library bundles its entire icon set unless tree-shaking is perfectly configured. Consolidating to one library (recommend lucide-react for best tree-shaking) reduces download size, improves caching, and simplifies maintenance.

---
*This spec was created from ideation and is pending detailed specification.*
