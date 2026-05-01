import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}',
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  theme: {
    extend: {
      colors: {
        "primary": "#a6331b",
        "on-primary": "#ffffff",
        "primary-container": "#c84b31",
        "on-primary-container": "#fffbff",
        "secondary": "#52652a",
        "on-secondary": "#ffffff",
        "secondary-container": "#d4eca2",
        "on-secondary-container": "#576b2f",
        "tertiary": "#00647d",
        "on-tertiary": "#ffffff",
        "background": "#f9f9f9",
        "on-background": "#1a1c1c",
        "surface": "#f9f9f9",
        "on-surface": "#1a1c1c",
        "surface-container": "#f2f4f2",
        "surface-container-low": "#f9f9f7",
        "surface-container-high": "#e8ebe8",
        "primary-fixed": "#ffdad4", // Standard MD3 Pink/Red fixed
        "error": "#ba1a1a",
        "on-error": "#ffffff",
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "sans-serif"],
        headline: ["var(--font-be-vietnam-pro)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
