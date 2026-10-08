import { describe, expect, it } from '@jest/globals';
import type { Control } from 'react-hook-form';
import { RHFActionSheetPicker } from '../../adapters/react-hook-form';

/** Compile-time checks for the adapter (run by `yarn typecheck`). */
type Values = { country: string | null; tags: string[] };
// Never rendered — only needs the right type.
const control = {} as Control<Values>;
const items = [{ label: 'Kenya', value: 'KE' }];

export const typeChecks = [
  <RHFActionSheetPicker
    key="single"
    control={control}
    name="country"
    items={items}
    onChange={(value: string | null) => value}
  />,
  <RHFActionSheetPicker
    key="multi"
    control={control}
    name="tags"
    multiple
    items={items}
    onChange={(values: string[]) => values}
  />,
  <RHFActionSheetPicker
    key="bad-name"
    control={control}
    // @ts-expect-error `name` must be a field of the form
    name="missing"
    items={items}
  />,
];

describe('adapter types', () => {
  it('compile (checked by tsc)', () => {
    expect(typeChecks).toHaveLength(3);
  });
});
