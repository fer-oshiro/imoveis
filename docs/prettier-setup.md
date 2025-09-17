# Prettier and Pre-commit Setup

This document describes the Prettier formatting and pre-commit hook setup for the project.

## What was installed/configured

### Dependencies

- `prettier` - Code formatter (already installed)
- `prettier-plugin-tailwindcss` - Tailwind CSS plugin for Prettier (already installed)
- `lint-staged` - Run linters on git staged files
- `husky` - Git hooks made easy

### Configuration Files

#### `.prettierrc`

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["clsx", "classnames", "cva"],
  "printWidth": 100,
  "semi": false,
  "singleQuote": true
}
```

#### `.prettierignore`

Excludes build artifacts, dependencies, and generated files from formatting.

#### `package.json` scripts

- `format` - Format all files with Prettier
- `format:check` - Check if files are formatted correctly
- `lint-staged` - Run lint-staged tasks
- `prepare` - Initialize Husky (runs on npm install)

#### `package.json` lint-staged configuration

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css,scss,md}": ["prettier --write"],
    "*.{js,jsx,ts,tsx}": ["npm run test:unit -- --run --reporter=verbose --passWithNoTests"]
  }
}
```

### Pre-commit Hook

- `.husky/pre-commit` - Runs `npm run lint-staged` before each commit
- Automatically formats staged files with Prettier
- Runs tests on staged TypeScript/JavaScript files
- Prevents commits if tests fail

## How it works

1. **On commit**: Husky triggers the pre-commit hook
2. **Formatting**: lint-staged runs Prettier on staged files matching the patterns
3. **Testing**: lint-staged runs tests on staged TypeScript/JavaScript files
4. **Validation**: If formatting or tests fail, the commit is aborted
5. **Success**: If everything passes, the commit proceeds with formatted code

## Manual commands

```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check

# Run lint-staged manually
npm run lint-staged

# Run tests
npm test
```

## Benefits

- ✅ Consistent code formatting across the entire codebase
- ✅ Automatic formatting on commit (no manual intervention needed)
- ✅ Tests run before commits to catch issues early
- ✅ Prevents poorly formatted or broken code from being committed
- ✅ Works with existing Prettier configuration
- ✅ Integrates seamlessly with the existing test suite

## Files affected

The initial setup formatted 123+ files across the entire codebase to ensure consistency. All future commits will maintain this formatting automatically.
