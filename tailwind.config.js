/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Gemini 风格色彩
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae0ff',
          300: '#7cc5ff',
          400: '#36aaff',
          500: '#0084ff',
          600: '#0066dd',
          700: '#0052b3',
          800: '#003d8a',
          900: '#002d66',
        },
        accent: {
          50: '#fff8f0',
          100: '#ffe8d6',
          200: '#ffd0ad',
          300: '#ffb884',
          400: '#ffa05b',
          500: '#ff8832',
          600: '#e67e2a',
          700: '#cc6f22',
          800: '#b35f1a',
          900: '#8a4812',
        },
        surface: {
          50: '#ffffff',
          100: '#f9f9f9',
          200: '#f3f3f3',
          300: '#ececec',
          400: '#e0e0e0',
          500: '#d4d4d4',
        },
      },
      backgroundImage: {
        'gradient-gemini': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-warm': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-cool': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
    },
  },
  plugins: [],
}
