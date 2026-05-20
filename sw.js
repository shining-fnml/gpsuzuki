/**
 * GPS Suzuki Service Worker
 * Provides offline-first functionality and caching strategy
 */

const CACHE_NAME = 'gpsuzuki-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/converter.js',
    '/app.js',
    '/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Installing and caching app shell');
            return cache.addAll(urlsToCache).catch(err => {
                console.warn('[Service Worker] Cache addAll failed, some assets may not be available:', err);
                // Don't fail the installation if some assets are missing
                return Promise.resolve();
            });
        })
    );
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(request).then(response => {
            // If found in cache, return it
            if (response) {
                return response;
            }
            
            // Otherwise, try to fetch from network
            return fetch(request)
                .then(response => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response for caching
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });
                    
                    return response;
                })
                .catch(() => {
                    // Network error - return cached version if available
                    return caches.match(request).catch(() => {
                        // If not in cache either, return offline page
                        return new Response('Offline - app not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
                });
        })
    );
});
