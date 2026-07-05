import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sage: {
          50: "#f4f6f3",
          100: "#e6ebe2",
          200: "#cdd8c5",
          300: "#aebf9f",
          400: "#8fa67c",
          500: "#728a5f",
          600: "#576b48",
          700: "#43523a",
          800: "#36412f",
          900: "#2c3527",
        },
        cream: {
          50: "#fefdfb",
          100: "#fbf8f1",
          200: "#f5eee0",
          300: "#ede2cc",
        },
        beige: {
          100: "#f1e9dc",
          200: "#e4d6bf",
          300: "#d4c1a0",
          400: "#c0a87d",
        },
        charcoal: {
          50: "#f6f6f6",
          200: "#d4d4d4",
          300: "#b0b0b0",
          400: "#5c5c5c",
          500: "#4a4a4a",
          600: "#3a3a3a",
          700: "#2d2d2d",
          800: "#232323",
          900: "#181818",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "marquee-slow": "marquee 55s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
