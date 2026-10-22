/* CodeBiruni WorkList service worker: local app shell cache + network-first CDN refresh. */
'use strict';
const VERSION = 'codebiruni-worklist-v1';
const APP_CACHE = `${VERSION}-app`;
const CDN_CACHE = `${VERSION}-cdn`;
const APP_SHELL = ['./', './index.html', './manifest.json', './icon.svg'];
const CDN_HOSTS = new Set(['cdn.tailwindcss.com', 'unpkg.com']);

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => ![APP_CACHE, CDN_CACHE].includes(key)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin && !CDN_HOSTS.has(url.hostname)) return;

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cache = await caches.open(APP_CACHE);
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok && (response.type === 'basic' || response.type === 'default')) cache.put(request, response.clone());
        return response;
      } catch (error) {
        const fallback = await cache.match('./index.html');
        if (fallback && (request.mode === 'navigate' || url.pathname.endsWith('/'))) return fallback;
        throw error;
      }
    })());
    return;
  }

  /* Network-first for CDN scripts/styles: refresh dependencies when online, retain a cached copy for offline starts. */
  event.respondWith((async () => {
    const cache = await caches.open(CDN_CACHE);
    try {
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') await cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      throw error;
    }
  })());
});
