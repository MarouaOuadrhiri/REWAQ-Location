import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#103E38",
        deep: "#1D5148",
        gold: "#C86A4A",
        ivory: "#FAF7F1",
      },
    },
  },
  plugins: [],
} satisfies Config;
