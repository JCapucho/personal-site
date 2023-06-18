module.exports = {
  env: {
    es2022: true,
    browser: true,
  },
  extends: [
    // Order is important here
    "eslint:recommended",
    "plugin:astro/recommended",
    "plugin:astro/jsx-a11y-strict",
  ],
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
      rules: {},
    },
    {
      // Define the configuration for `<script>` tag.
      // Script in `<script>` is assigned a virtual file name with the `.js` extension.
      files: ["**/*.astro/*.js", "*.astro/*.js"],
      parser: "@typescript-eslint/parser",
      rules: {
        "prettier/prettier": "off",
      },
    },
  ],
};
