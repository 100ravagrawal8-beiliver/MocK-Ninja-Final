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
        navy: { DEFAULT: "#0F1B2D", light: "#1A2A44", dark: "#0A1220" },
        gold: { DEFAULT: "#C9A84C", light: "#E0BF65" },
      },
    },
  },
  plugins: [],
};

export default config;
