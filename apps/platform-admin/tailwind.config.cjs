const preset = require('../../packages/tokens/src/tailwind.preset.cjs');
module.exports = {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/ui-admin/src/**/*.{ts,tsx}',
  ],
};
