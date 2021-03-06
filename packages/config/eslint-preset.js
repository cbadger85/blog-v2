const path = require('path');

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:prettier/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': ['warn', { extensions: ['.tsx'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    // 'import/no-extraneous-dependencies': [
    //   'error',
    //   {
    //     devDependencies: [
    //       '**/*.test.{ts,tsx}',
    //       '**/*.spec.{ts,tsx}',
    //       'setupTests.ts',
    //       'vite.config.ts',
    //       '.eslintrc.cjs',
    //     ],
    //     packageDir: [
    //       path.join(__dirname, '../../blog'),
    //       path.join(__dirname, '../core'),
    //       path.join(__dirname, '../generator'),
    //     ],
    //   },
    // ],
    'import/no-extraneous-dependencies': 'off',
    'react/require-default-props': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
    ],
    'no-underscore-dangle': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
    'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
    'react/destructuring-assignment': 'off',
    'max-classes-per-file': 'off',
    'prefer-template': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: ['**/*.d.ts'],
};
