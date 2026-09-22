import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Lemon Tree Editorial Color System
        lemon: {
          50: "#fdfee8",
          100: "#fbfdc4",
          200: "#f7fa8c",
          300: "#eef449",
          400: "#e2f952",
          500: "#d4ed31",
          600: "#b5cc1a",
          700: "#899d16",
          800: "#6d7c17",
          900: "#5a6818",
          950: "#2f3906",
          DEFAULT: "#e2f952",
        },
        forest: {
          50: "#f0fdf6",
          100: "#dcfce8",
          200: "#bbf7d1",
          300: "#86efad",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#14592e",
          900: "#0f3e22",
          950: "#061f12",
          DEFAULT: "#0f3e22",
        },
        moss: {
          50: "#f4f8f1",
          100: "#e5f0df",
          200: "#cbe1bf",
          300: "#a6cb94",
          400: "#7fb068",
          500: "#62944b",
          600: "#4b7639",
          700: "#3b5d2e",
          800: "#314b28",
          900: "#1b2d16",
          950: "#091207",
          DEFAULT: "#1b2d16",
        },
        citron: {
          400: "#f9f871",
          500: "#e6ff00",
          600: "#ccff00",
          DEFAULT: "#e6ff00",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          950: "#022c22",
        },
        cyan: {
          500: "#06b6d4",
          950: "#083344",
        }
      },
      fontFamily: {
        sans: ["Outfit", "var(--font-sans)", "sans-serif"],
        editorial: ["Syne", "sans-serif"],
        headline: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(1.5deg)" },
        },
        "pulse-lemon": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.08)" },
        },
        "lemon-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 15px rgba(226, 249, 82, 0.2), inset 0 0 15px rgba(226, 249, 82, 0.1)"
          },
          "50%": { 
            boxShadow: "0 0 35px rgba(226, 249, 82, 0.4), inset 0 0 20px rgba(226, 249, 82, 0.2)"
          },
        },
        "shine": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 5s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "pulse-lemon": "pulse-lemon 4s ease-in-out infinite",
        "lemon-glow": "lemon-glow 3s ease-in-out infinite",
        "shine": "shine 4s linear infinite",
        "radar-sweep": "radar-sweep 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
