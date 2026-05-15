import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  // Service worker file uses importScripts (not in browser globals)
  {
    files: ['public/sw.js', 'public/push-sw.js'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.worker },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Variables/args prefixed with _ are intentionally unused (convention)
      'no-unused-vars': ['error', { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      // These rules are new in react-hooks v5 and flag many intentional
      // patterns throughout the codebase (setState in effects, ref mutation).
      // Downgraded to 'off' until the codebase is migrated incrementally.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
    },
  },
])
