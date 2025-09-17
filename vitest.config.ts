import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/**/src/**/*.test.ts',
      'packages/**/src/**/*.test.js',
      'packages/**/__tests__/**/*.test.ts',
      'packages/**/__tests__/**/*.test.js'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.sst/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.vitepress/cache/**'
    ],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@functions': './packages/functions/src',
      '@core': './packages/core/src',
    },
  },
});