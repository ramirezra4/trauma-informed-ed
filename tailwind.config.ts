import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, trauma-informed palette
        primary: {
          50: '#fdf8f3',
          100: '#f9ede1',
          200: '#f3d9c1',
          300: '#ecc096',
          400: '#e3a16a',
          500: '#dc8850', // Main warm orange
          600: '#ce7244',
          700: '#ab5c3a',
          800: '#884c35',
          900: '#6e3f2d',
        },
        secondary: {
          50: '#faf7f0',
          100: '#f4edd7',
          200: '#e8d9af',
          300: '#dcc281',
          400: '#d1ab5c', // Warm beige/tan
          500: '#c69c49',
          600: '#b18c3e',
          700: '#936f36',
          800: '#795b32',
          900: '#654c2c',
        },
        neutral: {
          50: '#faf9f7',
          100: '#f5f3f0',
          200: '#e8e4de', // Warm off-white
          300: '#d8d1c7',
          400: '#c4b8a9',
          500: '#a99d8b', // Warm gray
          600: '#8e806e',
          700: '#726659',
          800: '#5d544a',
          900: '#4a423a',
        },
        success: {
          50: '#f0f9f4',
          100: '#dcf2e4',
          500: '#10b981', // Muted green for growth
        },
        background: '#fefcfa', // Warm white
        foreground: '#4a423a', // Warm dark for text
      },
      fontFamily: {
        'display': ['"Young Serif"', 'serif'],
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '6px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      }
    },
  },
  plugins: [],
};
export default config;