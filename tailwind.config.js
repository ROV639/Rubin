/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        base: '#FAF9F5',
        surface: '#FFFDF8',
        primary: '#C15F3C',
        accent: '#1C6BBB',
        text: '#1F1E1D',
        border: '#E0D9D0',
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Charter', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};