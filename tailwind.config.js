/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        base: '#F5F1E8',
        surface: '#FFFFFF',
        primary: '#1A2E45',
        neutral: '#1A2E45',
        accent: '#8A7248',
        text: '#1A2E45',
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
