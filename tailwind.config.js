/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Sunset Orange theme colors
        'sunset-orange': {
          50: '#fff2ed',
          100: '#ffe4d6',
          200: '#ffd4c4',
          300: '#ffbea9',
          400: '#ff8c42',
          500: '#ff6b35', // Primary
          600: '#e55a2b',
          700: '#cc4a21',
          800: '#b03a17',
          900: '#8b2d12',
        },
        // Complementary warm browns
        'warm-brown': {
          50: '#faf5f0',
          100: '#f0e6d6',
          200: '#e5d3bd',
          300: '#d4b896',
          400: '#cd853f',
          500: '#8b4513',
          600: '#7a3e11',
          700: '#68370f',
          800: '#56300d',
          900: '#2c1810',
        },
      },
    },
  },
  plugins: [],
}
