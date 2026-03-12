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

// Estrategia de interceptación de peticiones (Network First para datos, Cache First para estáticos)
self.addEventListener('fetch', (event) => {
    // Ignorar peticiones de Firebase/Google APIs para no interferir con la base de datos en tiempo real
    if (event.request.url.includes('firestore.googleapis.com') || 
        event.request.url.includes('firebase') ||
        event.request.url.includes('googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
