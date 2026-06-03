import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // New primary colors extracted from logo
          purple: "#7C3AED",
          "purple-light": "#A78BFA",
          "purple-dark": "#6D28D9",
          navy: "#0B0B2A",
          "navy-light": "#1E1E4A",
          "navy-dark": "#05051D",
          // Mappings to keep existing classes working with new theme
          blue: "#0B0B2A", // Navy
          "blue-light": "#1E1E4A",
          "blue-muted": "#1E1E4A",
          orange: "#7C3AED", // Purple
          "orange-light": "#A78BFA",
          "orange-dark": "#6D28D9",
        },
        surface: {
          DEFAULT: "#F9FAFB",
          card: "#FFFFFF",
          dark: "#0B0B2A",
          "dark-card": "#131338",
        },
        text: {
          primary: "#0B0B2A",
          secondary: "#4B5563",
          muted: "#9CA3AF",
          inverse: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        72: "18rem",
        84: "21rem",
        96: "24rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "brand-sm": "0 2px 8px rgba(124, 58, 237, 0.08)",
        brand: "0 4px 20px rgba(124, 58, 237, 0.12)",
        "brand-lg": "0 8px 40px rgba(124, 58, 237, 0.16)",
        "brand-xl": "0 16px 60px rgba(124, 58, 237, 0.20)",
        "navy-sm": "0 2px 8px rgba(11, 11, 42, 0.20)",
        navy: "0 4px 20px rgba(11, 11, 42, 0.30)",
        "navy-lg": "0 8px 40px rgba(11, 11, 42, 0.40)",
        glow: "0 0 30px rgba(124, 58, 237, 0.25)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
        "purple-gradient": "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
        "hero-gradient":
          "linear-gradient(135deg, #0B0B2A 0%, #312E81 50%, #1E1B4B 100%)",
        "card-gradient":
          "linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "mesh-gradient":
          "radial-gradient(at 20% 50%, rgba(124,58,237,0.15) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(59,130,246,0.10) 0px, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-down": "slideDown 0.3s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      screens: {
        xs: "475px",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
