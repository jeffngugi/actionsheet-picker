import { defineConfig } from 'vitepress';

const repo = 'https://github.com/jeffngugi/actionsheet-picker';

export default defineConfig({
  title: 'actionsheet-picker',
  description:
    'Searchable, grouped, infinite-scrolling bottom-sheet picker for React Native. Zero native dependencies.',
  // Served from https://jeffngugi.github.io/actionsheet-picker/
  base: '/actionsheet-picker/',
  cleanUrls: true,
  lastUpdated: true,
  head: [['meta', { name: 'theme-color', content: '#007AFF' }]],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api' },
      { text: 'Examples', link: '/examples' },
      {
        text: 'Links',
        items: [
          { text: 'npm', link: 'https://www.npmjs.com/package/actionsheet-picker' },
          { text: 'Changelog', link: `${repo}/blob/main/CHANGELOG.md` },
          { text: 'Issues', link: `${repo}/issues` },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Items and schema', link: '/guide/items' },
        ],
      },
      {
        text: 'Features',
        items: [
          { text: 'Grouped options', link: '/guide/grouped-options' },
          { text: 'Search', link: '/guide/search' },
          { text: 'Infinite lists', link: '/guide/infinite-lists' },
          { text: 'Multi-select', link: '/guide/multi-select' },
          { text: 'Forms', link: '/guide/forms' },
        ],
      },
      {
        text: 'Look and behaviour',
        items: [
          { text: 'Theming', link: '/guide/theming' },
          { text: 'Localization', link: '/guide/localization' },
          { text: 'Sheet, keyboard and safe areas', link: '/guide/sheet' },
          { text: 'Customization', link: '/guide/customization' },
        ],
      },
      {
        text: 'Quality',
        items: [
          { text: 'Testing', link: '/guide/testing' },
          { text: 'Accessibility', link: '/guide/accessibility' },
          { text: 'Compatibility', link: '/guide/compatibility' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API', link: '/api' },
          { text: 'Examples', link: '/examples' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: repo }],
    search: { provider: 'local' },
    editLink: {
      pattern: `${repo}/edit/main/docs/:path`,
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Geoffrey Ngugi',
    },
  },
});
