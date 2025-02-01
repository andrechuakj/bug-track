import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const ESLINT_OVERRIDES = {
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-commonjs': 'off',
    '@typescript-eslint/no-require-imports': 'off',
  },
};

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  ...ESLINT_OVERRIDES,
];
