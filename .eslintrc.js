module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:vue/vue3-strongly-recommended',
    'prettier',
  ],
  rules: {
    'vue/comment-directive': 0
  },
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: ['*.md'],
      parser: 'markdown-eslint-parser',
      extends: ['plugin:md/recommended', 'prettier'],
    },
  ],
};
