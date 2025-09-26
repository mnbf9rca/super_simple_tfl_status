const js = require('@eslint/js');
const jest = require('eslint-plugin-jest');
const prettier = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        URLSearchParams: 'readonly',

        // Node.js globals for module exports
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly'
      }
    },
    rules: {
      // Best practices
      eqeqeq: ['error', 'always'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console for this type of project
      'prefer-const': 'error',
      'no-var': 'error',

      // Style rules managed by prettier
      ...prettier.rules
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', 'jest.config.js'],
    plugins: {
      jest
    },
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
        module: 'readonly',
        exports: 'readonly',
        require: 'readonly',
        Blob: 'readonly',
        Buffer: 'readonly'
      }
    },
    rules: {
      ...jest.configs.recommended.rules,
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/prefer-to-have-length': 'warn',

      // Style rules managed by prettier
      ...prettier.rules
    }
  }
];
