import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0f2744", dark: "#0a1b30", light: "#1a3a5c" },
        gold: { DEFAULT: "#c9a227", light: "#e8c547" },
        cream: "#f6f3ee",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Noto Sans Gujarati", "sans-serif"],
        guj: ["var(--font-gujarati)", "Noto Sans Gujarati", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
