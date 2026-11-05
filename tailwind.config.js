/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "var(--color-paper)",
        "paper-2": "var(--color-paper-2)",
        ink: "var(--color-ink)",
        signal: "var(--color-signal)",
        acid: "var(--acid)",
        blush: "var(--blush)",
        void: '#05070c',
        regolith: '#c9ccd3',
        earth: '#6fb6ff',
        indigoBrand: '#4f46e5',
        sunlit: '#f2e6c9',
        borderMuted: '#1b2230',
        borderActive: '#2b3648',
        complianceGreen: '#10b981',
        alertAmber: '#f59e0b',
        hazardRed: '#ef4444',
      },
      letterSpacing: {
        widestHero: '0.28em',
      },
      fontFamily: {
        michroma: ['Michroma', 'sans-serif'],
        ibm: ['"IBM Plex Mono"', 'monospace'],
        editorial: ["var(--font-editorial)", "Georgia", "serif"],
        display: [
          "var(--font-display)",
          "'Arial Narrow'",
          "Helvetica",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
