import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import prefetch from "@astrojs/prefetch";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";

import robotsTxt from "astro-robots-txt";

// https://astro.build/config
export default defineConfig({
  site: "https://www.jcapucho.com",
  integrations: [
    mdx(),
    prefetch(),
    sitemap(),
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    robotsTxt(),
    compress(),
  ],
});
