import { describe, expect, it } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      return name === '__tests__' || name === 'adapters'
        ? []
        : sourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

describe('optional peer dependencies', () => {
  it('the main entry never imports react-hook-form', () => {
    const offenders = sourceFiles(SRC)
      .filter((file) =>
        /from ['"]react-hook-form['"]|require\(['"]react-hook-form['"]\)/.test(
          readFileSync(file, 'utf8')
        )
      )
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });

  it('only requires react-native-safe-area-context inside try/catch', () => {
    const importsIt =
      /from ['"]react-native-safe-area-context['"]|require\(['"]react-native-safe-area-context['"]\)/;
    const users = sourceFiles(SRC).filter((file) =>
      importsIt.test(readFileSync(file, 'utf8'))
    );
    expect(users.map((f) => relative(SRC, f))).toEqual(['ui/useAutoInsets.ts']);
    const code = readFileSync(users[0] as string, 'utf8');
    expect(code).toMatch(
      /try\s*{\s*const \w+ = require\('react-native-safe-area-context'\)/
    );
  });
});
