module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['import'],
  extends: ['plugin:import/errors', 'plugin:import/warnings'],
  rules: {
    // Enforce extensions in ESM imports
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'always',
        jsx: 'always',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
};
