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
        // Paleta Einstein: minimalista con tonos científicos
        background: "var(--background)",
        foreground: "var(--foreground)",
        'einstein': {
          50: '#f8f7ff',
          100: '#e9e7ff',
          200: '#d4d1ff',
          300: '#b5aeff',
          400: '#9180ff',
          500: '#7257ff',
          600: '#5c3bdb',
          700: '#4a2ab7',
          800: '#3d2294',
          900: '#321d75',
        },
        'genius': {
          50: '#fef6ee',
          100: '#fdebd7',
          200: '#fad3ae',
          300: '#f7b47a',
          400: '#f38a44',
          500: '#f06920',
          600: '#e14f16',
          700: '#ba3a14',
          800: '#943018',
          900: '#782916',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
