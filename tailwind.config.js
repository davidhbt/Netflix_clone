/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}", // Captures all files in `app/`
    "./Components/**/*.{js,jsx,ts,tsx}",
    // "./app/**/[...paths].{js,jsx,ts,tsx}", // Explicitly include dynamic routes
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
