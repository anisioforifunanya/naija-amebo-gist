/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'light-bg': '#ffffff',
        'light-text': '#111827',
        'light-border': '#e5e7eb',
        'dark-bg': '#111827',
        'dark-text': '#f3f4f6',
        'dark-border': '#374151',
      },
    },
  },
  plugins: [],
}