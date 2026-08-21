import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        canvas: "var(--canvas)",
        foreground: "hsl(var(--foreground))",
        overlay: "hsl(var(--overlay))",
        ink: {
          DEFAULT: "hsl(var(--foreground))",
          deep: "hsl(var(--foreground-deep))",
          strong: "hsl(var(--foreground-strong))",
          soft: "hsl(var(--foreground-soft))",
          muted: "hsl(var(--foreground-muted))",
          subtle: "hsl(var(--foreground-subtle))",
          inverse: "hsl(var(--primary-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "rgb(var(--primary-hover-rgb) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          DEFAULT: "rgb(var(--brand-rgb) / <alpha-value>)",
          hover: "rgb(var(--brand-hover-rgb) / <alpha-value>)",
          foreground: "rgb(255 255 255 / <alpha-value>)",
          gold: "rgb(var(--brand-gold-rgb) / <alpha-value>)",
          "gold-hover": "rgb(var(--brand-gold-hover-rgb) / <alpha-value>)",
          teal: "rgb(var(--brand-teal-rgb) / <alpha-value>)",
          "teal-hover": "rgb(var(--brand-teal-hover-rgb) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--surface-foreground))",
          subtle: "hsl(var(--surface-subtle))",
          muted: "hsl(var(--surface-muted))",
          soft: "rgb(var(--surface-soft-rgb) / <alpha-value>)",
          hover: "rgb(var(--surface-hover-rgb) / <alpha-value>)",
          table: "rgb(var(--surface-table-rgb) / <alpha-value>)",
          dialog: "rgb(var(--surface-dialog-rgb) / <alpha-value>)",
          footer: "rgb(var(--surface-footer-rgb) / <alpha-value>)",
          panel: "rgb(var(--surface-panel-rgb) / <alpha-value>)",
          "panel-hover": "rgb(var(--surface-panel-hover-rgb) / <alpha-value>)",
          strip: "rgb(var(--surface-strip-rgb) / <alpha-value>)",
          sheet: "rgb(var(--surface-sheet-rgb) / <alpha-value>)",
          selected: "rgb(var(--surface-selected-rgb) / <alpha-value>)",
          overlay: "hsl(var(--surface-overlay))",
        },
        line: {
          DEFAULT: "hsl(var(--border))",
          strong: "hsl(var(--line-strong))",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 18px 38px -30px rgba(15, 23, 42, 0.14)",
        card: "0 1px 1px rgba(15, 23, 42, 0.03), 0 12px 28px -24px rgba(15, 23, 42, 0.14)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.65)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
        display: ["var(--font-newsreader)"],
      },
      keyframes: {
        "sheet-in": {
          from: { opacity: "0", transform: "translate(-50%, -46%) scale(0.97)" },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        "sheet-in-right": {
          from: { opacity: "0", transform: "translate(2.5%, 0)" },
          to: { opacity: "1", transform: "translate(0, 0)" },
        },
        "overlay-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "ring-settle": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "sheet-in": "sheet-in 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        "sheet-in-right":
          "sheet-in-right 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        "overlay-in": "overlay-in 0.2s ease-out",
        "ring-settle": "ring-settle 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
