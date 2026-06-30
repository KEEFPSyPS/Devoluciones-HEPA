const CACHE_NAME = 'hepa-garantias-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './img/LogoHEPA.png',
    './img/logoAppHepa.png',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache abierta');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activación y limpieza de caches antiguas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Estrategia de interceptación de peticiones
self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    
    // NO interceptar NINGUNA petición a Firebase o Google APIs
    // Esto incluye WebChannel/Streaming que Firestore usa en tiempo real
    if (url.includes('firebase') || 
        url.includes('googleapis.com') || 
        url.includes('gstatic.com') ||
        url.includes('firebaseapp.com')) {
        return;
    }

    // Solo interceptar assets estáticos conocidos (Cache First)
    if (url.includes('cdn.tailwindcss.com') || 
        url.includes('cdnjs.cloudflare.com') ||
        url.includes('fonts.googleapis.com')) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    return cachedResponse || fetch(event.request);
                })
        );
        return;
    }

    // Para assets locales del proyecto (img, etc.)
    if (url.includes('/img/')) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    return cachedResponse || fetch(event.request);
                })
        );
        return;
    }

    // Para todo lo demás (incluyendo el HTML principal), dejar pasar sin interceptar
    return;
});
