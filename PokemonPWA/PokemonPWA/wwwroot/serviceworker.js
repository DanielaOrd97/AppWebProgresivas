// service-worker.js

let urls = ["/",
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
    //respondWith devuelve la respuesta directamente de la cache.
    event.respondWith(getFromCache(event.request));
});

async function getFromCache(request) {
    // Check if the URL uses the chrome-extension scheme or other unsupported schemes.
    //urls con esquema de chrome no pueden ser cacheadas, asi que solo hace la solicitud sin guardar en cache.
    try {
        if (request.url.startsWith('chrome-extension://')) {
            return fetch(request); // Simply fetch the request but don't cache it
        }

        let cache = await caches.open(cachename);

        //verificar si ya se encuentra la url en cache.
        let response = await cache.match(request);

        if (response) {
            return response; // Return the cached response if it exists
        } else {
            let respuesta = await fetch(request);
            if (respuesta && respuesta.ok) {
                cache.put(request, respuesta.clone()); // Cache the fetched response
                //clone es para almacenar la respuesta en cache y para devolverla, ya que una respuesta solo se puede usar una vez.
            }
            return respuesta;
        }
    }
    catch (error) {
        console.error("Error in getFromCache:", error);
        // Optionally return a fallback response
        return new Response("Network error", { status: 500 });
    }
}

/*
-Network only: Todo directamente de internet.
-Cache first: Si lo encuentra en cache lo regresa sino directo de internet.
-Cache only: Solo regresa lo que se encuentra en cache. (Juegos)
-Network First: Si hay internet regreso la informacion, de lo contrario regresa de la cache. Primero Internet.
-Stale While-Revalidate: Primero accede a cache mientras hace la busqueda en internet, al volver a ingresar se vera cache pero con la version actualizada.
Al mismo tiempo descarga cosas nuevas, pero siempre ve primero cache. Esto se hace al actualizar la app.
-Cache Then Revalidate: En este caso no es necesario provocar la actualizacion, ya que compara el json que se muestra
con el json actualizado que corre en segundo plano. El cambio se hace por si solo. version mejorada de Stale While-Revalidate.
*/