/** @type {import('tailwindcss').Config} */
module.exports = {
  jit: true,
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        bgColor: "var(--theme-bg)",
        textColor: "var(--theme-text)",
        accent: "var(--theme-accent)",
        "link-visited": "var(--theme-link-visited)",
      },
    typography: ({theme}) => ({
      capucho: {
        css: {
          "--tw-prose-body": "var(--theme-text)",
          "--tw-prose-headings": "var(--theme-accent)",
          "--tw-prose-links": "var(--theme-text)",
          "--tw-prose-bold": "var(--theme-text)",
          "--tw-prose-bullets": "var(--theme-text)",
          "--tw-prose-quotes": "var(--theme-quote)",
          "--tw-prose-code": "var(--theme-text)",
          "--tw-prose-hr": "0.5px dashed #666",
          "--tw-prose-th-borders": "#666",
        },
      },
    }),
    },
  },

  plugins: [require("@tailwindcss/typography")],
};
