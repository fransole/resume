/**
 * Service Worker for John Dorion's Portfolio
 * Provides offline caching for static assets
 */

// Increment version on each deployment to bust cache
const CACHE_VERSION = 'v1';
const CACHE_NAME = `portfolio-${CACHE_VERSION}`;

// Cache size limits
const MAX_CACHE_ITEMS = 50;
const MAX_CACHE_BYTES = 50 * 1024 * 1024; // 50MB total cache size
const MAX_SINGLE_ASSET_BYTES = 5 * 1024 * 1024; // 5MB per asset
const TRIM_DEBOUNCE_COUNT = 10; // Only trim every N cache writes

// Base path for GitHub Pages deployment (update if deploying elsewhere)
const BASE_PATH = '/resume';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/resume/`,
  `${BASE_PATH}/pottery/`,
  `${BASE_PATH}/blog/`,
  `${BASE_PATH}/404.html`,
  `${BASE_PATH}/favicon.svg`,
  `${BASE_PATH}/social_img.webp`
];

// Track cache writes for debouncing
let cacheWriteCount = 0;

/**
 * Estimate response size from Content-Length header or blob
 */
async function getResponseSize(response) {
  const contentLength = response.headers.get('content-length');
  if (contentLength) {
    return parseInt(contentLength, 10);
  }
  // Fallback: clone and check blob size
  try {
    const clone = response.clone();
    const blob = await clone.blob();
    return blob.size;
  } catch {
    return 0;
  }
}

/**
 * Calculate total cache size in bytes
 */
async function getCacheSize(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  let totalSize = 0;

  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      totalSize += await getResponseSize(response);
    }
  }

  return totalSize;
}

/**
 * Trim cache when over limits
 * Uses FIFO eviction (oldest entries removed first)
 */
async function trimCache(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  // Check item count limit
  if (keys.length > MAX_CACHE_ITEMS) {
    const toDelete = keys.length - MAX_CACHE_ITEMS;
    await Promise.all(keys.slice(0, toDelete).map((key) => cache.delete(key)));
    return;
  }

  // Check byte size limit
  const totalSize = await getCacheSize(cacheName);
  if (totalSize > MAX_CACHE_BYTES) {
    // Remove oldest entries until under limit
    let currentSize = totalSize;
    for (const request of keys) {
      if (currentSize <= MAX_CACHE_BYTES * 0.8) break; // Target 80% of limit
      try {
        const response = await cache.match(request);
        if (response) {
          const size = await getResponseSize(response);
          await cache.delete(request);
          currentSize -= size;
        }
      } catch (err) {
        // Continue trimming even if individual delete fails
        console.warn('Cache trim error for item:', err);
      }
    }
  }
}

/**
 * Add response to cache with size and debounced trimming
 */
async function cacheWithLimit(request, response) {
  // Skip caching oversized assets
  const size = await getResponseSize(response.clone());
  if (size > MAX_SINGLE_ASSET_BYTES) {
    return;
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response);

  // Debounce trim - only run every N writes
  // Intentional fire-and-forget: trimCache runs asynchronously without blocking
  // the cache write. This provides eventual consistency - cache may temporarily
  // exceed limits but will be trimmed on the next trigger. This is acceptable
  // for a portfolio site where exact cache limits aren't critical.
  cacheWriteCount++;
  if (cacheWriteCount >= TRIM_DEBOUNCE_COUNT) {
    cacheWriteCount = 0;
    trimCache(CACHE_NAME);
  }
}

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches and trim current
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old cache versions
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith('portfolio-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      // Trim current cache on activation
      await trimCache(CACHE_NAME);
    })()
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // For HTML pages: Network first, cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            cacheWithLimit(request, responseClone);
          }
          return response;
        })
        .catch(() => {
          // Return cached version or offline page
          return caches.match(request).then((cached) => {
            return cached || caches.match(`${BASE_PATH}/404.html`);
          });
        })
    );
    return;
  }

  // For assets (images, scripts, styles): Cache first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached and update in background (stale-while-revalidate)
        // Intentional fire-and-forget pattern: We don't await the cache update
        // because we want to return the cached response immediately. If the SW
        // terminates before the update completes, it's acceptable - the user
        // still got their content and we'll retry on the next visit.
        fetch(request).then((response) => {
          if (response.ok) {
            cacheWithLimit(request, response);
          }
        }).catch((err) => console.warn('Background cache update failed:', err));
        return cached;
      }

      // Not in cache, fetch from network
      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          cacheWithLimit(request, responseClone);
        }
        return response;
      });
    })
  );
});
