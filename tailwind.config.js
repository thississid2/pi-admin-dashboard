/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pi-dark': '#112025',
        'pi-dark-light': '#22313a',
        'pi-green': '#1A7F5A',
        'pi-green-light': '#E6F9F0',
        'pi-green-border': '#B2F7EF',
      },
    },
  },
  plugins: [],
}
