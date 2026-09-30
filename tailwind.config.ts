import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0F14',      // page background
        surface: '#121820',  // cards
        raise: '#1A222C',    // hovers, wells
        edge: '#243040',     // borders
        fg: '#E6EBF0',
        mut: '#8B98A5',
        amber: '#F0B429',    // primary action / activity
        mint: '#2DD4A7',     // savings / success
        danger: '#F26D6D',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
