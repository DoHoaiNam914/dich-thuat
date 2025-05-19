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
  '/js/color-modes.js',
  '/js/index.js',
  '/js/Reader.js',
  '/js/service-worker.js',
  '/js/Translation.js',
  '/js/Utils.js'
]
async function precache (): Promise<void> {
  const cache = await self.caches.open(cacheName)
  return await cache.addAll(precachedResources)
}
// @ts-expect-error
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(precache())
})
async function cacheFirst (request): Promise<Response> {
  const cachedResponse = await self.caches.match(request)
  if (cachedResponse != null) return cachedResponse
  try {
    const networkResponse = await self.fetch(request)
    if (networkResponse.ok) {
      const cache = await self.caches.open(cacheName)
      void cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    return Response.error()
  }
}
// async function cacheFirstWithRefresh (request): Promise<Response> {
//   const fetchResponsePromise = self.fetch(request).then(async networkResponse => {
//     if (networkResponse.ok) {
//       const cache = await self.caches.open(cacheName)
//       void cache.put(request, networkResponse.clone())
//     }
//     return networkResponse
//   })
//   return await caches.match(request) ?? await fetchResponsePromise
// }
// async function networkFirst (request): Promise<Response> {
//   try {
//     const networkResponse = await self.fetch(request)
//     if (networkResponse.ok) {
//       const cache = await self.caches.open(cacheName)
//       void cache.put(request, networkResponse.clone())
//     }
//     return networkResponse
//   } catch (_e) {
//     const cachedResponse = await self.caches.match(request)
//     return cachedResponse ?? Response.error()
//   }
// }
// @ts-expect-error
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url)
  if (precachedResources.includes(url.pathname)) event.respondWith(cacheFirst(event.request))
  // event.respondWith(cacheFirstWithRefresh(event.request))
  // event.respondWith(networkFirst(event.request))
})
