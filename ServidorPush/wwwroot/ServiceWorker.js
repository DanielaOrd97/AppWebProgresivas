self.addEventListener("push", async function (e) {

    let clientes = await self.clients.matchAll({type:"window"});
    let mensaje = e.data.text();

    if (clientes.length == 0) {
        self.registration.showNotification("Mensaje nuevo:", {
            body: mensaje
            /*icon:*/
        });
    }
    else {
        clientes.forEach(c => {
            c.postMessage(mensaje);
        });
    }
});