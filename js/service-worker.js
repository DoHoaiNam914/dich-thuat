'use strict'
/* global caches, fetch */
const cacheName = 'Dịch thuật'
const precachedResources = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/atkinson-hyperligible.css',
  '/css/fonts.css',
  '/css/index.css',
  '/css/Roboto.css',
  '/css/themes.css',
  '/js/index.js',
  '/js/Reader.js',
  '/js/service-worker.js',
  '/js/Translation.js',
  '/js/Utils.js',
  '/lib/color-modes.js',
  '/lib/papaparse.min.js'
]
// async function precache (): Promise<void> {
//   const cache = await caches.open(cacheName)
//   return await cache.addAll(precachedResources)
// }
// addEventListener('install', event => {
//   (event as ExtendableEvent).waitUntil(precache())
// })
// async function cacheFirst (request: Request): Promise<Response> {
//   const cachedResponse = await caches.match(request)
//   if (cachedResponse != null) return cachedResponse
//   try {
//     const networkResponse = await fetch(request)
//     if (networkResponse.ok) {
//       const cache = await caches.open(cacheName)
//       void cache.put(request, networkResponse.clone()) // eslint-disable-line no-void
//     }
//     return networkResponse
//   } catch {
//     return Response.error()
//   }
// }
// async function cacheFirstWithRefresh (request: Request): Promise<Response> {
//   const fetchResponsePromise = fetch(request).then(async networkResponse => {
//     if (networkResponse.ok) {
//       const cache = await caches.open(cacheName)
//       void cache.put(request, networkResponse.clone()) // eslint-disable-line no-void
//     }
//     return networkResponse
//   })
//   return await caches.match(request) ?? await fetchResponsePromise
// }
async function networkFirst (request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      void cache.put(request, networkResponse.clone()) // eslint-disable-line no-void
    }
    return networkResponse
  } catch {
    const cachedResponse = await caches.match(request)
    return cachedResponse ?? Response.error()
  }
}
addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  // if (precachedResources.includes(url.pathname)) (event as FetchEvent).respondWith(cacheFirst((event as FetchEvent).request))
  // if (precachedResources.includes(url.pathname)) (event as FetchEvent).respondWith(cacheFirstWithRefresh((event as FetchEvent).request))
  if (precachedResources.includes(url.pathname)) { event.respondWith(networkFirst(event.request)) }
})
