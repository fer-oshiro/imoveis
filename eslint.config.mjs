import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.sst/**',
      '**/.open-next/**',
      '**/.next/**',
      '**/.artifacts/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            './tsconfig.json',
            './packages/*/tsconfig.json',
        ] }, 
        node: true,
      },
      react: { version: 'detect' },
    },
    rules: {
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        },
      ],
      'no-console': 'warn',
    },
  },

  {
    files: ['apps/**/src/**/*.{ts,tsx,js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },

  {
    files: ['**/*.{test,spec}.{ts,tsx,js}'],
    languageOptions: {
      globals: {
        ...globals.node,
        describe: true, it: true, test: true, expect: true, vi: true,
        beforeAll: true, afterAll: true, beforeEach: true, afterEach: true,
      },
    },
  },

  eslintConfigPrettier,
];
