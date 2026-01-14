import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import createSlug from '../../lib/createSlug';

// Define static pages
const staticPages = {
  'index': {
    title: 'John Dorion - Consulting Engineer & Cybersecurity Enthusiast',
    description: 'Cloud infrastructure specialist, two-time CTF champion, and homelab builder'
  },
  'resume': {
    title: 'Professional Resume & Experience',
    description: '28+ certifications in AWS, Red Hat, Splunk | Consulting Engineer at Silex Data Solutions'
  },
  'pottery': {
    title: 'Handmade Ceramic Pottery',
    description: 'Wheel-thrown bowls, mugs, vases, and functional art pieces'
  },
  'blog': {
    title: 'Technical Blog',
    description: 'Writing about NixOS, homelab infrastructure, CTF competitions, and cybersecurity'
  }
};

// Get all blog posts
const posts = await getCollection('blog');

// Create pages object with both static and blog pages
const pages = Object.fromEntries([
  // Add static pages
  ...Object.entries(staticPages).map(([path, data]) => [path, data]),
  // Add blog posts with slugified titles
  ...posts.map((post) => {
    const slug = createSlug(post.data.title, post.id);
    return [`blog/${slug}`, {
      title: post.data.title,
      description: post.data.description
    }];
  })
]);

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages: pages,
  getImageOptions: (_path, page) => {
    return {
      title: page.title,
      description: page.description,
      bgGradient: [[24, 24, 27], [39, 39, 42]],
      border: { color: [200, 180, 130], width: 20 },
      padding: 80,
      font: {
        title: {
          color: [255, 255, 255],
          size: 72,
          families: ['Inter', 'Noto Sans', 'sans-serif'],
          weight: 'Bold'
        },
        description: {
          color: [200, 180, 130],
          size: 42,
          families: ['Inter', 'Noto Sans', 'sans-serif'],
          lineHeight: 1.5
        }
      },
      fonts: [
        'https://api.fontsource.org/v1/fonts/inter/latin-400-normal.ttf',
        'https://api.fontsource.org/v1/fonts/inter/latin-700-normal.ttf',
      ]
    };
  },
});
