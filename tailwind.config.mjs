import typographyPlugin from "@tailwindcss/typography";

function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `hsl(var(${variable}))`;
    }
    return `hsl(var(${variable}) / ${opacityValue})`;
  };
}

export default {
  jit: true,
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        bgColor: withOpacityValue("--theme-bg"),
        textColor: withOpacityValue("--theme-text"),
        accent: withOpacityValue("--theme-accent"),
        accent2: withOpacityValue("--theme-accent2"),
        quoteColor: withOpacityValue("--theme-quote"),
        codeBG: withOpacityValue("--theme-code-bg"),
      },
      typography: ({ theme }) => ({
        capucho: {
          css: {
            "--tw-prose-body": theme("colors.textColor"),
            "--tw-prose-headings": theme("colors.accent2"),
            "--tw-prose-links": theme("colors.textColor"),
            "--tw-prose-bold": theme("colors.textColor"),
            "--tw-prose-bullets": theme("colors.textColor"),
            "--tw-prose-quotes": theme("colors.quoteColor"),
            "--tw-prose-code": theme("colors.textColor"),
            "--tw-prose-hr": theme("colors.textColor"),
            "--tw-prose-th-borders": theme("colors.textColor"),
          },
        },
        DEFAULT: {
          css: {
            a: {
              "@apply no-underline": "",
            },
            strong: {
              fontWeight: "700",
            },
            code: {
              color: theme("colors.textColor"),
              backgroundColor: theme("colors.codeBG"),
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
            blockquote: {
              borderLeftWidth: "none",
            },
            "blockquote::before": {
              content: "none",
            },
            "blockquote::after": {
              content: "none",
            },
            hr: {
              borderTopStyle: "dashed",
            },
            thead: {
              borderBottomWidth: "none",
            },
            "thead th": {
              fontWeight: "700",
              borderBottom: "1px dashed #666",
            },
            "tbody tr": {
              borderBottomWidth: "none",
            },
            tfoot: {
              borderTop: "1px dashed #666",
            },
          },
        },
      }),
    },
  },

  plugins: [typographyPlugin],
};
