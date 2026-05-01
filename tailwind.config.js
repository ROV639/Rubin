/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        base: '#F4F1EC',
        surface: '#FFFFFF',
        primary: '#4A6D8C',
        neutral: '#6B7A8D',
        accent: '#4A6D8C',
        text: '#6B7A8D',
        border: '#E0D9D0',
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Noto Sans SC', 'DM Sans', 'sans-serif'],
        mono: ['Fira Code', 'Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
