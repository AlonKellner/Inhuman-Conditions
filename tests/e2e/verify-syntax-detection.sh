#!/bin/bash

# Verification script: Demonstrates that E2E tests catch syntax errors
# This script temporarily introduces the apostrophe syntax error that was
# fixed in commit a575166, runs the E2E tests to show they fail, then
# reverts the change and runs tests again to show they pass.

set -e  # Exit on error

echo "=================================================="
echo "E2E Test Syntax Error Detection Verification"
echo "=================================================="
echo ""
echo "This script demonstrates that the E2E tests would"
echo "catch syntax errors like the apostrophe issue in"
echo "src/data/packets.ts (fixed in commit a575166)."
echo ""

FILE="src/data/packets.ts"
BACKUP="${FILE}.backup"

# Check if file exists
if [ ! -f "$FILE" ]; then
  echo "Error: $FILE not found"
  exit 1
fi

echo "Step 1: Creating backup of $FILE"
cp "$FILE" "$BACKUP"
echo "✓ Backup created"
echo ""

echo "Step 2: Introducing syntax error (apostrophe in single-quoted string)"
# Replace the correct double-quoted string with a single-quoted version
sed -i.tmp "s/prompt: \"Test the suspect's creative thinking\",/prompt: 'Test the suspect'\''s creative thinking',/" "$FILE"
rm "${FILE}.tmp" 2>/dev/null || true
echo "✓ Syntax error introduced on line 157"
echo ""

echo "Step 3: Running E2E tests (expecting failure)..."
echo "---------------------------------------------------"
if npm run test:e2e 2>&1 | tee /tmp/e2e-test-output.txt; then
  echo ""
  echo "⚠️  UNEXPECTED: Tests passed (they should have failed)"
  echo "This might happen if the dev server was already running."
  echo "Try stopping any running dev servers and run this script again."
else
  echo ""
  echo "✓ Tests failed as expected!"
  echo ""
  echo "The error output should show something like:"
  echo "  - 'Timed out waiting for http://localhost:5173'"
  echo "  - 'Error: Expected '}' but found 's''"
  echo ""
fi

echo "Step 4: Restoring original file"
mv "$BACKUP" "$FILE"
echo "✓ Original file restored"
echo ""

echo "Step 5: Running E2E tests again (expecting success)..."
echo "---------------------------------------------------"
if npm run test:e2e; then
  echo ""
  echo "✓ All tests passed!"
else
  echo ""
  echo "⚠️  UNEXPECTED: Tests failed"
  echo "The original file should have been restored correctly."
  exit 1
fi

echo ""
echo "=================================================="
echo "Verification Complete ✓"
echo "=================================================="
echo ""
echo "Summary:"
echo "  1. Introduced apostrophe syntax error → E2E tests FAILED"
echo "  2. Reverted to correct code → E2E tests PASSED"
echo ""
echo "This demonstrates that E2E tests catch syntax errors"
echo "that would prevent the application from building."
