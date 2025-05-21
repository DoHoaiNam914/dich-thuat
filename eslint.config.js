// @ts-check

import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  {
    files: ['src/ts/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: './src/ts/tsconfig.json'
      }
    }
  }
)
