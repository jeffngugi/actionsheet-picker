export const countries = [
  'Algeria',
  'Angola',
  'Botswana',
  'Burundi',
  'Cameroon',
  'Côte d’Ivoire',
  'Democratic Republic of the Congo',
  'Egypt',
  'Eritrea',
  'Ethiopia',
  'Gabon',
  'Ghana',
  'Kenya',
  'Lesotho',
  'Liberia',
  'Madagascar',
  'Malawi',
  'Mali',
  'Morocco',
  'Mozambique',
  'Namibia',
  'Niger',
  'Nigeria',
  'Rwanda',
  'Senegal',
  'Sierra Leone',
  'Somalia',
  'South Africa',
  'South Sudan',
  'Sudan',
  'Tanzania',
  'Togo',
  'Tunisia',
  'Uganda',
  'Zambia',
  'Zimbabwe',
].map((name) => ({
  label: name,
  value: name.slice(0, 3).toUpperCase() + name.length,
}));

/** Raw "API" objects — mapped with `schema`, no conversion needed. */
export const banks = [
  { id: 101, bank_name: 'Equatorial Bank', swift: 'EQBKXX' },
  { id: 102, bank_name: 'Highland Savings', swift: 'HLSVXX' },
  {
    id: 103,
    bank_name: 'Lakeside Credit Union',
    swift: 'LKCUXX',
    closed: true,
  },
  { id: 104, bank_name: 'Savannah Trust', swift: 'SVTRXX' },
];

/**
 * Option groups: each parent holds its options under a custom key
 * (`options`). Parents are group headers; a parent without options is a
 * normal selectable option.
 */
export const optionGroups = [
  {
    label: 'Fruits',
    value: 10,
    options: [
      { label: 'Apple', value: 11 },
      { label: 'Banana', value: 12 },
      { label: 'Mango', value: 13 },
      { label: 'Pineapple', value: 14 },
    ],
  },
  {
    label: 'Vegetables',
    value: 20,
    options: [
      { label: 'Carrot', value: 21 },
      { label: 'Spinach', value: 22 },
      { label: 'Sukuma wiki', value: 23 },
    ],
  },
  { label: 'Water', value: 30 },
  {
    label: 'Grains',
    value: 40,
    options: [
      { label: 'Maize', value: 41 },
      { label: 'Rice', value: 42 },
      { label: 'Sorghum', value: 43 },
    ],
  },
  {
    label: 'Dairy',
    value: 50,
    options: [
      { label: 'Milk', value: 51 },
      { label: 'Yoghurt', value: 52, disabled: true },
      { label: 'Cheese', value: 53 },
    ],
  },
];

export interface Employee {
  id: number;
  name: string;
}

const allEmployees: Employee[] = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  name: `${['Amina', 'Brian', 'Chloe', 'David', 'Esther', 'Felix', 'Grace', 'Hassan'][i % 8]} ${['Otieno', 'Mensah', 'Diallo', 'Banda', 'Okafor', 'Mwangi'][i % 6]} #${i + 1}`,
}));

/** Fake paginated, searchable endpoint (30 per page, 600 ms latency). */
export function fetchEmployees(
  search: string,
  page: number
): Promise<{ data: Employee[]; hasMore: boolean }> {
  const q = search.trim().toLowerCase();
  const matches = q
    ? allEmployees.filter((e) => e.name.toLowerCase().includes(q))
    : allEmployees;
  const start = page * 30;
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          data: matches.slice(start, start + 30),
          hasMore: start + 30 < matches.length,
        }),
      600
    )
  );
}

/** Large list for scroll/search performance checks. */
export const bigList = Array.from({ length: 2000 }, (_, i) => ({
  label: `Item ${String(i + 1).padStart(4, '0')}`,
  value: i + 1,
}));
