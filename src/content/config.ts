import { z, reference, defineCollection } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    isDraft: z.boolean().default(false),
    title: z.string(),
    description: z.string(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
    language: z.enum(["en"]).default("en"),
    tags: z.array(z.string()).default([]),
    footnote: z.string().optional(),
    publishDate: z.date(),
    lastEditDate: z.date().optional(),
    relatedPosts: z.array(reference("blog")).default([]),
  }),
});

export const collections = {
  blog: blogCollection,
};
