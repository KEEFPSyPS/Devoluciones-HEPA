const CACHE_NAME = 'hepa-garantias-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './img/LogoHEPA.png',
    './img/logoAppHepa.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache abierta');
                // Usar addAll con manejo de errores individual
                const cachePromises = ASSETS_TO_CACHE.map(url => {
                    return cache.add(url).catch(err => {
                        console.warn(`No se pudo cachear: ${url}`, err);
                    });
                });
                return Promise.all(cachePromises);
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
                        console.log('Eliminando cache antigua:', cache);
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
    if (url.includes('firebase') || 
        url.includes('googleapis.com') || 
        url.includes('gstatic.com') ||
        url.includes('firebaseapp.com')) {
        return;
    }

    // Solo interceptar assets estáticos conocidos (Cache First)
    if (url.includes('cdnjs.cloudflare.com') ||
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
