import { z, reference, defineCollection } from "astro:content";
import { config } from "@/config";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    draft: z.boolean().default(false),
    title: z.string(),
    description: z.string(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
        attribution: z.string().optional(),
      })
      .optional(),
    language: z.enum([config.locale]).default(config.locale),
    tags: z.array(z.string()),
    publishDate: z.date(),
    lastEditDate: z.date().optional(),
    relatedPosts: z.array(reference("blog")).default([]),
  }),
});

export const collections = {
  blog: blogCollection,
};
