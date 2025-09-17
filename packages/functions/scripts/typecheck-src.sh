#!/bin/bash

# Run TypeScript compilation and capture output
output=$(npx tsc --noEmit src/domain/*/services/*.ts src/domain/*/entities/*.ts src/domain/*/repositories/*.ts src/domain/*/dto/*.ts src/domain/*/vo/*.ts src/domain/*/errors/*.ts src/domain/shared/**/*.ts src/http/**/*.ts 2>&1)
exit_code=$?

# Filter out known external dependency errors
filtered_output=$(echo "$output" | grep -v "node_modules/sst/dist/vector/index.d.ts" | grep -v "node_modules/vite/dist/node/index.d.ts" | grep -v "node_modules/vitest/dist/chunks/reporters.d.BFLkQcL6.d.ts")

# Check if there are any remaining errors (our code errors)
if [ -n "$filtered_output" ]; then
    echo "❌ TypeScript compilation failed with errors in your code:"
    echo "$filtered_output"
    exit 1
else
    if [ $exit_code -ne 0 ]; then
        echo "⚠️  TypeScript found some external dependency issues, but your code compiles successfully!"
    else
        echo "✅ TypeScript compilation successful!"
    fi
    exit 0
fi