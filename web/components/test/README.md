# Test Components

Disposable test components for evaluating design implementations.

## Purpose
- Test React/TypeScript component integrations without guidance
- Observe how external components interact with brand tokens
- Easy to delete when done testing

## Structure
```
test/
└── [component-name]/
    ├── [component-file].tsx
    └── README.md (observations)
```

## Cleanup
Delete this entire folder when testing is complete.
No production dependencies should reference files here.
