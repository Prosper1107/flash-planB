import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        flash: {
          blue: "#1B4FE8",
          "blue-dark": "#1340C5",
          "blue-light": "#3D6BFF",
          "blue-50": "#EEF2FF",
          "blue-100": "#D4DEFF",
          white: "#FFFFFF",
          gray: "#F5F7FF",
          "gray-text": "#6B7280",
          "gray-border": "#E5E7EB",
          dark: "#0D1B3E",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        },
      },
      backgroundImage: {
        "flash-gradient": "linear-gradient(135deg, #1B4FE8 0%, #3D6BFF 100%)",
        "flash-gradient-dark":
          "linear-gradient(135deg, #0D1B3E 0%, #1B4FE8 100%)",
      },
      boxShadow: {
        flash: "0 4px 24px rgba(27, 79, 232, 0.15)",
        "flash-lg": "0 8px 40px rgba(27, 79, 232, 0.25)",
        card: "0 2px 12px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
