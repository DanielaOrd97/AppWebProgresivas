﻿// service-worker.js

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

    if (event.request.url.contains(".jpg")) {
        //respondWith devuelve la respuesta directamente de la cache.
        event.respondWith(cacheFirst(event.request));
    }

    //si viene de la api
    else if (event.request.url.startsWith("https://itesrc.net/api")) {
        event.respondWith(staleWhileRevalidate(event.request));
    }
    else {
        event.respondWith(fetch(event.request));
    }
  
});

async function cacheFirst(request) {
    try {

        let cache = await caches.open(cachename);

        //verificar si ya se encuentra la url en cache.
        let response = await cache.match(request);

        if (response) {
            return response; // Return the cached response if it exists
        } else {
            let respuesta = await fetch(request);
            if (respuesta && respuesta.ok) {
                cache.put(request, respuesta.clone()); 
            }
            return respuesta;
        }
    }
    catch (error) {
        console.log(x);
    }
}


async function cacheOnly(request) {
    try{

        let cache = await caches.open(cachename);

        //verificar si ya se encuentra la url en cache.
        let response = await cache.match(request);

        if (response) {
            return response;
        } else {
            return new Response("No se encontro en cache."); //se puede regresar tambien una vista por ejemplo. 
            }
        
    }
    catch (error) {
        console.log(x);
    }
}

async function NetworkFirst(request) {

    try {
        let respuesta = await fetch(url); //primero hace el request a internet.
        if (respuesta.Ok) {  //si lo encuentra
            let cache = await caches.open(cachename);  //abro cache
            cache.put(request, respuesta.clone()); //actualizo la informacion.
            return respuesta;
        }

    }
    catch (error) {   //entra en este catch si no hay internet.
        let response = await cache.match(request);
        if (response) {
            return response;
        }
        else {
            console.log(x);
        }
    }
}

async function staleWhileRevalidate(request) {

    try {

        let cache = await caches.open(cachename);
        let response = await cache.match(request); //si lo encuentra en cache solo lo regresa.

        //Al mismo tiempo esta haciendo el fetch a internet.
        //Then deja corriendo en segundo plano mientras se termina de hacer el fetch. Sin el await porque es un metodo promesa.
        let r = fetch(request).then(response => {
            //guardar en cache la respuesta.
            cache.put(request, response.clone());
            return response;
        });

        return response || r; //si se tiene una respuesta regresala o espera a r.
    }
    catch (error) {
        console.log(x);
    }
}


let channel = new BroadcastChannel("refreshchannel");

async function StaleThenRevalidate(request){

    let cache = await caches.open(cachename);
    let response = await cache.match(request);

    if (response) {

        fetch(request).then(async (res) => {
            let networkresponse = await fetch(request);
            let cacheData = await response.text();
            let networkData = await networkresponse.clone().text();

            if (cacheData != networkData) {
                cache.put(request, networkresponse.clone());
                channel.postMessage({
                    Url: request.url, Data: networkData
                });
            }
        });
        return response.clone();
    }
    else {
        return NetworkFirst(request);
    }
}

let maxage = 24 * 60 * 60 * 1000; //24hrs
async function timeBaseCache(req) {
    let cache = await caches.open(cacheName);

    let cacheresponse = await cache.match(req);

    if (cacheresponse) {
        let fechaDescarga = cacheresponse.headers.get("fecha"); //obtener fecha
        let fecha = new Date(fechaDescarga);
        let hoy = new Date();
        let diferencia = hoy - fecha;

        if (diferencia <= maxage) { // si no ha caducado.
            return cacheresponse;
        }

    }

        let netResponse = await fetch(req);

        //crear una nueva respuesta
        //let nuevoResponse = new Response(netResponse.body, {

        //    statusText: netResponse.statusText,
        //    status: netResponse.status,
        //    headers: { fecha: new Date().toISOString() }
        //}); //agregar el header con la fecha actual.


        //EN EL CASO DE COPIAR TAMIBIEN LOS HEADERS QUE YA TENGA LA RESPUESTA.
        let nuevoResponse = new Response(netResponse.body, {

            statusText: netResponse.statusText,
            status: netResponse.status,
            headers: netResponse.headers,
            type: netResponse.type
        });
        
        nuevoResponse.headers.append("fecha", new Date().toISOString())

        cache.put(req, nuevoResponse);
        return netResponse;
}


async function NetworkCacheRace(req) {
    let cache = await caches.open(cacheName);

    let promise1 = fetch(req).then(response => {
        cache.put(req, response.clone());
        return response;
    });
    let promise2 = cache.match(req);

    return Promise.race([promise1, promise2]);
}


//Para nombres de lab: cache first mixto con network first para lo demas. (Proyecto)




/*
-Network only: Todo directamente de internet.
-Cache first: Si lo encuentra en cache lo regresa sino directo de internet, despues guarda en cache.
-Cache only: Solo regresa lo que se encuentra en cache. (Juegos) Solo pide inf del servidor una sola vez, despues solo cache.
-Network First: Si hay internet regreso la informacion, de lo contrario regresa de la cache. Primero Internet.
-Stale While-Revalidate: Primero accede a cache mientras hace la busqueda en internet, al volver a ingresar se vera cache pero con la version actualizada.
Al mismo tiempo descarga cosas nuevas, pero siempre ve primero cache. Esto se hace al actualizar la app. (Facebook)
-Stale Then Revalidate: En este caso no es necesario provocar la actualizacion, ya que compara el json que se muestra
con el json actualizado que corre en segundo plano. El cambio se hace por si solo. version mejorada de Stale While-Revalidate.
-Time-Based Cache: Incluye tiempo. Se pone un tiempo especifico y cuando ese excede, se vuelve a actualizar la cache. (Cache first con timer).
-Cache-Network Race: Se hace peticion a internet y a cache al mismo tiempo. La que termine primero es la que se regresa.
(Cuando se tiene un buen internet que puede hacer competencia con la cache). Gasta mas recursos.
-Cache with Push Update: Cuando se ordena de un servicio externo (API) que se haga una actualizacion. Aviso Push proviene del exterior.

CACHE SOLO CON PETICIONES GET.
*/ 