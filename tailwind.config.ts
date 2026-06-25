import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Brand palette — premium, trustworthy blues/indigos with warm accent.
        brand: {
          50: "#eef4ff",
          100: "#dae5ff",
          200: "#bcd0ff",
          300: "#8eb1ff",
          400: "#5886fc",
          500: "#315ef5",
          600: "#1d3fe9",
          700: "#172fd6",
          800: "#1929ad",
          900: "#1a2989",
          950: "#151a54",
        },
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae3",
          300: "#b1bccb",
          400: "#8696ac",
          500: "#667591",
          600: "#515e78",
          700: "#434d62",
          800: "#3a4253",
          900: "#343a47",
          950: "#22262f",
        },
      },
      fontFamily: {
        sans: ["var(--font-latin)", "var(--font-arabic)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,24,40,.12)",
        card: "0 1px 3px rgba(16,24,40,.06), 0 1px 2px rgba(16,24,40,.04)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "fade-in": "fade-in .4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
