/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors
        navy: "#1A365D",
        sage: "#6B9080",
        
        // Secondary colors
        slate: "#4A5568",
        "light-blue": "#EBF8FF",
        
        // Accent colors
        alert: "#F6AD55",
        warning: "#FC8181",
        success: "#68D391",
        
        // Neutral colors
        white: "#FFFFFF",
        "light-gray": "#F7FAFC",
        "medium-gray": "#E2E8F0",
        "dark-gray": "#2D3748",
      },
      fontFamily: {
        sans: ["Inter"],
      },
      fontSize: {
        "h1": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "h2": ["24px", { lineHeight: "32px", fontWeight: "700" }],
        "h3": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "h4": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "small": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "tiny": ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      spacing: {
        "4": "4px",
        "8": "8px",
        "16": "16px",
        "24": "24px",
        "32": "32px",
        "48": "48px",
        "64": "64px",
        "96": "96px",
      },
      borderRadius: {
        DEFAULT: "8px",
        "lg": "12px",
        "full": "9999px",
      },
      boxShadow: {
        "card": "0 2px 4px rgba(0, 0, 0, 0.05)",
        "dropdown": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "button": "0 1px 2px rgba(0, 0, 0, 0.05)",
      },
      maxWidth: {
        "content": "1200px",
      },
      screens: {
        "mobile": "320px",
        "tablet": "640px",
        "desktop": "1024px",
      },
      animation: {
        "risk-pulse": "risk-pulse 2s infinite",
      },
      keyframes: {
        "risk-pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
      },
    },
  },
  plugins: [],
}
