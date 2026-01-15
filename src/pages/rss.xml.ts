import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import { getCollection } from "astro:content";
import createSlug from "../lib/createSlug";
import { getBaseUrl } from "../lib/getBaseUrl";

export async function GET(_context: APIContext): Promise<Response> {
  try {
    const blog = await getCollection("blog");
    const base = getBaseUrl();
    return rss({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      site: 'https://johndorion.com',
      items: blog.map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `${base}blog/${createSlug(post.data.title, post.id)}/`,
      })),
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to generate RSS feed:", error);
    }
    return new Response("Failed to generate RSS feed", { status: 500 });
  }
}
