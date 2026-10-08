import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: fixupConfigRules(compat.extends('@react-native', 'prettier')),
    plugins: { prettier },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    // Optional peers may only be imported by their adapter entry points, so
    // the main entry never requires them.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/adapters/**', 'src/__tests__/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-hook-form',
              message:
                'Optional peer: import it only from src/adapters/react-hook-form.tsx.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['node_modules/', 'lib/', 'coverage/', 'scripts/compat/'],
  },
]);
