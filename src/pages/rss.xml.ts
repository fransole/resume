import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import { getCollection } from "astro:content";
import createSlug from "../lib/createSlug";

export async function GET(_context: APIContext): Promise<Response> {
  try {
    const blog = await getCollection("blog");
    return rss({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      site: import.meta.env.SITE,
      items: blog.map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${createSlug(post.data.title, post.id)}/`,
      })),
    });
  } catch (error) {
    console.error("Failed to generate RSS feed:", error);
    return new Response("Failed to generate RSS feed", { status: 500 });
  }
}
