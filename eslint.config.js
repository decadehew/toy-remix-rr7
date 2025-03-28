import { defineConfig } from 'eslint/config'
import eslintPluginImportX from 'eslint-plugin-import-x'
import pluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const ERROR = 'error'
const WARN = 'warn'

export default defineConfig([
  {
    ignores: [
      '**/.cache/**',
      '**/node_modules/**',
      '**/build/**',
      '**/public/**',
      '**/*.json',
      '**/playwright-report/**',
      '**/server-build/**',
      '**/dist/**',
      '**/coverage/**',
      '.react-router/*',
    ],
  },
  ...tseslint.configs.recommended,
  // all files
  {
    // files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: {
      import: eslintPluginImportX,
    },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // https://eslint.org/docs/latest/rules/no-unexpected-multiline#rule-details
      'no-unexpected-multiline': ERROR,
      // https://eslint.org/docs/latest/rules/no-warning-comments
      // 已被凍結，不能使用功能
      'no-warning-comments': [
        ERROR,
        { terms: ['FIXME'], location: 'anywhere' },
      ],
      // https://eslint.org/docs/latest/rules/no-duplicate-imports
      'import/no-duplicates': [WARN, { 'prefer-inline': true }],
      // https://github.com/import-js/eslint-plugin-import
      'import/order': [
        WARN,
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          pathGroups: [{ pattern: '#*/**', group: 'internal' }],
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
        },
      ],
    },
  },
  // React
  {
    files: ['**/*.tsx', '**/*.jsx'],
    plugins: { react: pluginReact },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        jsx: true,
      },
    },
    rules: {
      'react/jsx-key': WARN,
    },
  },
  // React Hooks
  {
    files: ['**/*.ts?(x)', '**/*.js?(x)'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': ERROR,
      'react-hooks/exhaustive-deps': WARN,
    },
  },
  // JS and JSX files，核心規則
  {
    files: ['**/*.js?(x)'],
    rules: {
      'no-undef': ERROR,

      // most of these rules are useful for JS but not TS because TS handles these better
      // if it weren't for https://github.com/import-js/eslint-plugin-import/issues/2132
      // we could enable this :(
      // 'import/no-unresolved': ERROR,
      'no-unused-vars': [
        WARN,
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^ignored',
        },
      ],
    },
  },
  // TS and TSX files
  // 覆蓋前面 preset 推薦配置
  {
    files: ['**/*.ts?(x)'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
      // 替代方案
      globals: {
        // React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        WARN,
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^ignored',
        },
      ],
      'import/consistent-type-specifier-style': [WARN, 'prefer-inline'],
      '@typescript-eslint/consistent-type-imports': [
        WARN,
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
        },
      ],

      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],

      '@typescript-eslint/no-floating-promises': 'error',

      // https://typescript-eslint.io/troubleshooting/faqs/eslint#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      // 直接交給 TS 處理，因為官方說 TS 類型檢查會比 eslint 更好
      // 'no-undef': 'off',

      // here are rules we've decided to not enable. Commented out rather
      // than setting them to disabled to avoid them being referenced at all
      // when config resolution happens.

      // @typescript-eslint/require-await - sometimes you really do want
      // async without await to make a function async. TypeScript will ensure
      // it's treated as an async function by consumers and that's enough for me.

      // @typescript-eslint/prefer-promise-reject-errors - sometimes you
      // aren't the one creating the error, and you just want to propagate an
      // error object with an unknown type.

      // @typescript-eslint/only-throw-error - same reason as above.
      // However, this rule supports options to allow you to throw `any` and
      // `unknown`. Unfortunately, in Remix you can throw Response objects,
      // and we don't want to enable this rule for those cases.

      // @typescript-eslint/no-unsafe-declaration-merging - this is a rare
      // enough problem (especially if you focus on types over interfaces)
      // that it's not worth enabling.

      // @typescript-eslint/no-unsafe-enum-comparison - enums are not
      // recommended or used in epic projects, so it's not worth enabling.

      // @typescript-eslint/no-unsafe-unary-minus - this is a rare enough
      // problem that it's not worth enabling.

      // @typescript-eslint/no-base-to-string - this doesn't handle when
      // your object actually does implement toString unless you do so with
      // a class which is not 100% of the time. For example, the timings
      // object in the epic stack uses defineProperty to implement toString.
      // It's not high enough risk/impact to enable.

      // @typescript-eslint/no-non-null-assertion - normally you should not
      // use ! to tell TS to ignore the null case, but you're a responsible
      // adult and if you're going to do that, the linter shouldn't yell at
      // you about it.

      // @typescript-eslint/restrict-template-expressions - toString is a
      // feature of many built-in objects and custom ones. It's not worth
      // enabling.

      // @typescript-eslint/no-confusing-void-expression - what's confusing
      // to one person isn't necessarily confusing to others. Arrow
      // functions that call something that returns void is not confusing
      // and the types will make sure you don't mess something up.

      // these each protect you from `any` and while it's best to avoid
      // using `any`, it's not worth having a lint rule yell at you when you
      // do:
      // - @typescript-eslint/no-unsafe-argument
      // - @typescript-eslint/no-unsafe-call
      // - @typescript-eslint/no-unsafe-member-access
      // - @typescript-eslint/no-unsafe-return
      // - @typescript-eslint/no-unsafe-assignment
    },
  },
])
