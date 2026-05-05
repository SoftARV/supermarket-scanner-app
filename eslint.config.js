const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const tsParser = require('@typescript-eslint/parser');
const rnPlugin = require('eslint-plugin-react-native');

module.exports = defineConfig([
  // Expo base — already bundles import, @typescript-eslint, react, react-hooks
  ...expoConfig,

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { __DEV__: true },
    },
    plugins: {
      'react-native': rnPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // ── TypeScript ───────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // ── React ────────────────────────────────────────────────────
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/self-closing-comp': 'warn',

      // ── React Hooks ──────────────────────────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // ── React Native ─────────────────────────────────────────────
      'react-native/no-unused-styles': 'error',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'off',
      'react-native/sort-styles': 'off',

      // ── General ──────────────────────────────────────────────────
      'no-console': 'error',

      // ── Import order ─────────────────────────────────────────────
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{ pattern: '@/**', group: 'internal' }],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',
    },
  },

  {
    ignores: ['node_modules/**', 'android/**', 'ios/**', '.expo/**', 'babel.config.js', 'eslint.config.js'],
  },
]);
