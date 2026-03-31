/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern, emotion-driven palette (Non-traditional golf colors)
        primary: "#10b981", // Emerald
        secondary: "#6366f1", // Indigo
        accent: "#f43f5e", // Rose
        dark: "#020617", // Slate-950
      },
    },
  },
  plugins: [],
}