import plugin from "tailwindcss/plugin";


export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  purge: [],

  theme: {
    extend: {},
  },

  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".input-style": {
          "@apply w-full p-2 rounded border bg-gray-50 text-gray-900 border-gray-300":
            {},
          "@apply dark:bg-gray-700 dark:text-white dark:border-gray-600": {},
          "@apply focus:outline-none focus:ring-2 focus:ring-blue-300": {},
        },
      });
    }),
  ],
};