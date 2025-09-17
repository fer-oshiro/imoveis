import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    {
        files: ['**/*.{js,mjs,cjs,ts}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
        },
        rules: {
            // Unused variable rules
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'no-unused-vars': 'off', // Turn off base rule as it can report incorrect errors

            // Other useful rules
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/prefer-optional-chain': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',

            // Import rules
            'no-duplicate-imports': 'error',

            // General code quality
            'prefer-const': 'error',
            'no-var': 'error',
            'no-console': 'warn',
        },
    },
    {
        files: ['**/*.test.{js,ts}', '**/__tests__/**/*.{js,ts}'],
        rules: {
            // Allow console in tests
            'no-console': 'off',
            // Allow any in tests for mocking
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
]

export default eslintConfig