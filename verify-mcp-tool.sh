#!/bin/bash
# MCP Tool Verification Script
# Verifies that the decide tool loads correctly with all 10 analysis types

set -e

echo "=========================================="
echo "MCP Tool Verification Script"
echo "Testing: decide tool with 10 analysis types"
echo "=========================================="
echo ""

# Step 1: Build the project
echo "Step 1: Building project..."
npm run build
if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed"
  exit 1
fi
echo ""

# Step 2: Check that the built file exists
echo "Step 2: Checking build output..."
if [ -f "dist/index.js" ]; then
  echo "✅ dist/index.js exists"
else
  echo "❌ dist/index.js not found"
  exit 1
fi
echo ""

# Step 3: Type check
echo "Step 3: Running TypeScript type check..."
npm run lint
if [ $? -eq 0 ]; then
  echo "✅ Type check passed"
else
  echo "❌ Type check failed"
  exit 1
fi
echo ""

# Step 4: Run tests
echo "Step 4: Running test suite..."
npm run test:run
if [ $? -eq 0 ]; then
  echo "✅ All tests passed"
else
  echo "❌ Tests failed"
  exit 1
fi
echo ""

# Step 5: Verify tool schema contains all 10 analysis types
echo "Step 5: Verifying analysis types in built code..."
ANALYSIS_TYPES=(
  "pros-cons"
  "weighted-criteria"
  "decision-tree"
  "expected-value"
  "scenario-analysis"
  "eisenhower-matrix"
  "cost-benefit"
  "risk-assessment"
  "reversibility"
  "regret-minimization"
)

echo "Checking for all 10 analysis types in dist/index.js..."
for type in "${ANALYSIS_TYPES[@]}"; do
  if grep -q "\"$type\"" dist/index.js; then
    echo "  ✅ $type"
  else
    echo "  ❌ $type NOT FOUND"
    exit 1
  fi
done
echo ""

# Step 6: Verify formatter methods exist
echo "Step 6: Verifying formatter methods in dist/tools/decideServer.js..."
FORMATTERS=(
  "formatEisenhowerMatrix"
  "formatCostBenefitAnalysis"
  "formatRiskAssessment"
  "formatReversibilityAnalysis"
  "formatRegretMinimization"
)

for formatter in "${FORMATTERS[@]}"; do
  if grep -q "$formatter" dist/tools/decideServer.js; then
    echo "  ✅ $formatter"
  else
    echo "  ❌ $formatter NOT FOUND"
    exit 1
  fi
done
echo ""

echo "=========================================="
echo "✅ ALL VERIFICATION CHECKS PASSED!"
echo "=========================================="
echo ""
echo "The decide tool is ready with all 10 analysis types:"
echo "  1. pros-cons"
echo "  2. weighted-criteria"
echo "  3. decision-tree"
echo "  4. expected-value"
echo "  5. scenario-analysis"
echo "  6. eisenhower-matrix (NEW)"
echo "  7. cost-benefit (NEW)"
echo "  8. risk-assessment (NEW)"
echo "  9. reversibility (NEW)"
echo " 10. regret-minimization (NEW)"
echo ""
echo "To start the MCP server:"
echo "  npm start"
echo ""
echo "To test with an MCP client (e.g., Claude Desktop):"
echo "  1. Configure the client to connect to this server"
echo "  2. Use the decide tool with any of the 10 analysis types"
echo "  3. Verify the formatted output displays correctly"
echo ""
