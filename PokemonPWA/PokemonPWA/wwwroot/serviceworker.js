// service-worker.js

let urls = [
    "/index",
    "/datos",
    "/estilos.css",
    "/imgs/icono.png",
    "/imgs/icono-128.png",
    "/imgs/icono-512.png",
    "/imgs/pokemon.png"
];

let cachename = "pokemonCachev1";
async function precache() {
    let cache = await caches.open(cachename); 
    await cache.addAll(urls);
}

//precache en evento install: descargar todos los archivos.
self.addEventListener("install", function (e) {
    e.waitUntil(precache());
});

self.addEventListener('fetch', event => {
    event.waitUntil(getFromCache(event.request));
});

async function getFromCache(url) {
    let cache = await caches.open(cachename);
    //verificar si ya se encuentra la url en cache.
    let response = await cache.match(url);

    if (response) {
        return response;
    }
    else {
        return await fetch(url);
    }
}