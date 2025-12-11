import globals from 'globals';
import dastyle from 'eslint-config-dicodingacademy';

export default [
  dastyle,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      indent: ['error', 4],
      'linebreak-style': ['error', 'windows'],
    },
  },
  {
    files: ['migrations/**/*.js'],
    rules: {
      camelcase: 'off',
    },
  },
  {
    // PERBAIKAN: Mengubah '._test.js' menjadi '.test.js'
    files: ['src/**/*.test.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      camelcase: 'off',
    },
  },
  {
    files: ['src/Applications/security/*.js', 'src/Domains/**/*Repository.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/Interfaces/http/api/**/handler.js'],
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^h$' }],
    },
  },
];
