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
        background: "#000000",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#0a0a0a",
          foreground: "#a3a3a3",
        },
        muted: {
          DEFAULT: "#171717",
          foreground: "#737373",
        },
        accent: {
          DEFAULT: "#262626",
          foreground: "#ffffff",
        },
        border: "#262626",
        input: "#0a0a0a",
        card: "#0a0a0a",
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
        // Extended gray scale
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
        xl: "16px",
        "2xl": "20px",
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Outfit", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        "display-lg": ["4rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-sm": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(255, 255, 255, 0.1)",
        "glow-md": "0 0 20px rgba(255, 255, 255, 0.15)",
        "glow-lg": "0 0 40px rgba(255, 255, 255, 0.1)",
        "glow-success": "0 0 20px rgba(34, 197, 94, 0.3)",
        "glow-error": "0 0 20px rgba(239, 68, 68, 0.3)",
        "inner-glow": "inset 0 0 20px rgba(255, 255, 255, 0.05)",
        "card": "0 4px 20px rgba(0, 0, 0, 0.5)",
        "card-hover": "0 20px 40px rgba(0, 0, 0, 0.7)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "grid-pattern": `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        "gradient-shine": "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.1) 50%, transparent 75%)",
      },
      animation: {
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "ticker": "ticker 20s linear infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)" },
          "100%": { boxShadow: "0 0 30px rgba(255, 255, 255, 0.2)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
