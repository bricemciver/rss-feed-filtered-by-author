import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['typescript', 'import', 'jsdoc', 'vitest'],
  env: {
    es2017: true,
    node: true,
  },
  ignorePatterns: ['*.config.ts', '*.config.mts'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],

    'no-console': 'error',
    'no-alert': 'error',
    'no-param-reassign': 'error',
    'prefer-template': 'error',
    'no-bitwise': 'error',
    complexity: ['error', { max: 33 }],
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
    'guard-for-in': 'error',
    'array-callback-return': ['error', { allowImplicit: true }],
    'max-lines': ['error', { max: 300, skipComments: true, skipBlankLines: true }],
  },
  overrides: [
    {
      files: ['*.ts', '*.d.ts'],
      rules: {
        'typescript/ban-ts-comment': 'error',
        'typescript/consistent-type-imports': 'error',
        'typescript/no-unnecessary-type-assertion': 'error',
        'typescript/prefer-for-of': 'error',
        'typescript/no-floating-promises': ['error', { ignoreVoid: true }],
        'typescript/no-dynamic-delete': 'error',
        'typescript/no-unsafe-member-access': 'error',
        'typescript/unbound-method': 'error',
        'typescript/no-explicit-any': 'error',
        'typescript/no-empty-function': 'off',
        'typescript/prefer-optional-chain': ['error'],
        'typescript/no-redundant-type-constituents': 'off',
        'typescript/restrict-template-expressions': 'off',
        'typescript/await-thenable': 'warn',
        'typescript/no-base-to-string': 'warn',
        'no-restricted-globals': ['error', 'window', 'document', 'location', 'navigator'],
      },
    },
    {
      files: ['*.test.ts'],
      rules: {
        'no-console': 'off',
        'no-unused-expressions': 'off',
        'no-unsafe-optional-chaining': 'off',
        'max-lines': 'off',
        'vitest/no-conditional-tests': 'off',
      },
    },
  ],
});
