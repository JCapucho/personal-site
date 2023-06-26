import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { config } from "../config";
import { getCollection } from "astro:content";

export async function get(context: APIContext) {
  const blog = await getCollection("blog", ({ data }) => {
    return data.draft !== true;
  });

  return rss({
    title: `${config.title}’s Blog`,
    description: "A humble Astronaut’s guide to the stars",
    site: context.site!.toString(),
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
  });
}
