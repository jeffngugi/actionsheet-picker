import { describe, expect, it } from '@jest/globals';
import { ActionSheetPicker } from '../../ui/ActionSheetPicker';

/**
 * Compile-time checks: `yarn typecheck` fails if value/onChange inference
 * regresses. The JSX is never rendered.
 */
const countries = [{ label: 'Kenya', value: 'KE' }];
const setString = (_: string | null) => {};
const setStrings = (_: string[]) => {};
const setNumber = (_: number | null) => {};

export const typeChecks = [
  // single: V inferred from value → onChange can be a typed setter
  <ActionSheetPicker
    key="single"
    items={countries}
    value={null as string | null}
    onChange={setString}
  />,
  // multi: V inferred as string from value: string[]
  <ActionSheetPicker
    key="multi"
    multiple
    items={countries}
    value={[] as string[]}
    onChange={setStrings}
  />,
  // schema with a computed label on raw objects
  <ActionSheetPicker
    key="schema"
    items={[{ id: 1, first: 'A', last: 'B' }]}
    schema={{ value: 'id', label: (u) => `${u.first} ${u.last}` }}
    value={null as number | null}
    onChange={setNumber}
  />,
  // @ts-expect-error multi onChange receives an array, not a single value
  <ActionSheetPicker
    key="bad-multi-setter"
    multiple
    items={countries}
    value={[] as string[]}
    onChange={setString}
  />,
  <ActionSheetPicker
    key="bad-single-value"
    items={countries}
    value={[] as string[]}
    // @ts-expect-error single select needs a single value, not an array
    onChange={setStrings}
  />,
];

describe('public types', () => {
  it('compile (checked by tsc)', () => {
    expect(typeChecks).toHaveLength(5);
  });
});
