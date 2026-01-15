import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import { getCollection } from "astro:content";
import createSlug from "../lib/createSlug";
import { getBaseUrl } from "../lib/getBaseUrl";
import { debugError } from "../lib/debug";

export async function GET(_context: APIContext): Promise<Response> {
  try {
    const blog = await getCollection("blog");
    const base = getBaseUrl();

    // Validate and filter posts with required fields
    const validPosts = blog.filter((post) => {
      const hasRequiredFields = post.data.title && post.data.pubDate && post.data.description;
      if (!hasRequiredFields && import.meta.env.DEV) {
        console.warn(`RSS: Skipping post "${post.id}" - missing required fields`);
      }
      return hasRequiredFields;
    });

    return rss({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      site: 'https://johndorion.com',
      items: validPosts.map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `${base}blog/${createSlug(post.data.title, post.id)}/`,
      })),
    });
  } catch (error) {
    debugError("Failed to generate RSS feed:", error);
    return new Response("Failed to generate RSS feed", { status: 500 });
  }
}
