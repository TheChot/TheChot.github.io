// Self-destructing service worker.
//
// The old create-react-app site registered a service worker at this exact path, and it cached the
// whole site aggressively. Anyone who ever visited thechot.github.io still has that worker
// installed, and it will go on serving them the *old* page from its cache no matter what is
// uploaded here — the request never reaches GitHub.
//
// Deleting the file would not fix it: a 404 leaves the already-installed worker in place. The only
// way out is to ship a replacement at the same URL that tears itself down. Browsers re-check this
// file in the background, see it has changed, install it, and then this code deletes every cache,
// unregisters the worker and reloads any open tab onto the real page.
//
// Keep this file here. It costs nothing, and removing it would strand every returning visitor on a
// cached copy of a site that no longer exists.

self.addEventListener('install', () => {
  // Don't wait for the old worker to be released — take over at the first opportunity.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));

    await self.registration.unregister();

    // Reload whatever tabs are open so the visitor lands on the new page immediately rather than
    // staring at the old one until they happen to refresh.
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
      client.navigate(client.url);
    }
  })());
});
