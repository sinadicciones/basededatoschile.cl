import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae6ff",
          200: "#bcd2ff",
          300: "#8eb4ff",
          400: "#598bff",
          500: "#2f63f5",
          600: "#1c46e0",
          700: "#1736b6",
          800: "#192f8f",
          900: "#1a2d72",
          950: "#141d45",
        },
        accent: {
          400: "#22d3a8",
          500: "#10b981",
          600: "#059669",
        },
        ink: "#0b1020",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.06), 0 8px 24px -8px rgba(16,24,40,.18)",
        glow: "0 0 0 1px rgba(47,99,245,.15), 0 20px 60px -20px rgba(47,99,245,.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%,100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up .4s ease-out both",
        "pulse-dot": "pulse-dot 1.2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
