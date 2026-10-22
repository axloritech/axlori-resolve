import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Axlori Resolve brand palette (see lib/constants.ts for hex sources of truth)
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          active: "#1E40AF",
          subtle: "#EFF6FF",
          border: "#BFDBFE",
        },
        navy: {
          DEFAULT: "#172554",
          900: "#172554",
          800: "#1E3A8A",
          700: "#1D4ED8",
        },
        page: "#F8FAFC",
        card: "#FFFFFF",
        ink: "#0F172A",
        muted: "#64748B",
        line: "#E2E8F0",
        success: "#15803D",
        warning: "#B45309",
        danger: "#B91C1C",
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.05)",
        pop: "0 8px 24px rgba(15, 23, 42, 0.12)",
      },
      maxWidth: {
        shell: "1280px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
