const preset = require('../../packages/tokens/src/tailwind.preset.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/ui-mobile/src/**/*.{ts,tsx}',
  ],
};
