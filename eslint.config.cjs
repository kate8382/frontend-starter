const prettierPlugin = require('eslint-plugin-prettier'); // Plugin to run Prettier as an ESLint rule
const prettierConfig = require('eslint-config-prettier/flat'); // Config to disable ESLint rules that conflict with Prettier (flat version)
const { defineConfig } = require('eslint/config'); // Importing the defineConfig function from ESLint's config module for better type support and configuration structure

module.exports = defineConfig([
  {
    // Apply to JS and TS files project-wide
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '.github/**',
      '.vscode/**',
      '.husky/**',
      '**/*.lock',
      '**/*.yml',
      '**/*.png',
      '**/*.jpg',
      '**/*.jpeg',
      '**/*.gif',
      '**/*.ico',
      '**/*.svg',
      '**/*.webp',
      '**/*.woff',
      '**/*.woff2',
      '**/*.ttf',
      '**/*.eot',
      '**/*.otf',
      '**/*.zip',
      '**/*.pdf',
      '**/*.bin',
    ],
  },
  {
    // Generic JS/TS settings and common rules
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: { prettier: prettierPlugin },
    rules: {
      'no-console': 'off', // Allow console statements for debugging
      'func-names': 'off', // Allow anonymous functions for flexibility
      'spaced-comment': ['error', 'always'], // Enforce space after comment markers for readability
      'no-inline-comments': 'off', // Allow inline comments for quick explanations
      'multiline-comment-style': 'off', // Allow any style of multiline comments for flexibility
      quotes: 'off', // Disable ESLint's built-in quotes rule to avoid conflicts with Prettier
      semi: ['error', 'always'], // Enforce semicolons for consistency
      'no-unused-vars': ['warn'], // Warn about unused variables to keep code clean
      indent: ['error', 2], // Enforce 2-space indentation for consistency
      'no-var': 'error', // Disallow var to encourage modern JavaScript practices
      'linebreak-style': ['error', 'unix'], // Enforce Unix linebreaks for cross-platform consistency
      'keyword-spacing': ['error', { before: true, after: true }], // Enforce spacing around keywords for readability
      'no-restricted-globals': 'off', // Allow all global variables for flexibility
      'no-alert': 'off', // Allow alert statements for debugging
      'no-plusplus': 'off', // Allow ++ and -- operators for convenience
      'max-len': 'off', // Disable max line length rule for flexibility
      'no-param-reassign': ['off'], // Allow parameter reassignment for flexibility
      'prefer-const': 'off', // Allow let even when variables are not reassigned
      'no-undef': 'off', // Allow undefined variables for flexibility
      'no-restricted-syntax': 'off', // Allow all syntax for flexibility
      'import/no-extraneous-dependencies': 'off', // Allow all dependencies for flexibility
      'prettier/prettier': ['warn', { singleQuote: true, endOfLine: 'auto' }], // Enforce Prettier formatting rules
    },
  },
  {
    // TypeScript specific settings
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      prettier: prettierPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn'],
      'no-unused-vars': 'off',
      'prettier/prettier': ['warn', { singleQuote: true, endOfLine: 'auto' }],
    },
  },
  // Prettier config should be last to disable conflicting ESLint rules
  prettierConfig,
]);
