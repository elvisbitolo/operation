const CACHE_NAME = 'wa-clone-v1';

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
    // Basic fetch listener (network first)
});
