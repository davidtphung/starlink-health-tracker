import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./client/src/**/*.{ts,tsx}", "./client/index.html"],
  theme: {
    extend: {
      colors: {
        spacex: {
          dark: "#000000",
          darker: "#000000",
          blue: "#005288",
          accent: "#a7d1f0",
          gold: "#f5a623",
          success: "#00c853",
          warning: "#ff9800",
          danger: "#f44336",
          muted: "#6b7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', "Menlo", "monospace"],
      },
      spacing: {
        "phi-1": "4px",
        "phi-2": "8px",
        "phi-3": "12px",
        "phi-4": "20px",
        "phi-5": "32px",
        "phi-6": "52px",
        "phi-7": "84px",
        "phi-8": "136px",
      },
      maxWidth: {
        container: "1200px",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0,82,136,0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(0,82,136,0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
