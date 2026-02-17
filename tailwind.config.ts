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
        sans: [
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "system-ui",
          "sans-serif",
        ],
        display: [
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "system-ui",
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', "Menlo", "monospace"],
      },
      spacing: {
        "phi-1": "4px",
        "phi-2": "8px",
        "phi-3": "13px",
        "phi-4": "21px",
        "phi-5": "34px",
        "phi-6": "55px",
        "phi-7": "89px",
        "phi-8": "144px",
      },
      maxWidth: {
        container: "1400px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 20s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
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
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0,82,136,0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(0,82,136,0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
