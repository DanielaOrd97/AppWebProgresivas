/*import(colocar CND)*/

document.querySelector(".fab").addEventListener("click", (e) => {
    /*window.location.href = "/agregar";
    No cambia url.
    */
    window.location.replace("agregar");
});

//peticion
async function actualizar() {
    let result = await fetch("api/Pendientes");

    if (result.ok) {
        let listapendientes = await result.json();

        let tbody = document.querySelector("tbody");

        //listapendientes.forEach(p => {});
        for (let pendiente of listapendientes) {
            let tr = tbody.insertRow(); //internamente hace create y append.
            let td = tr.insertCell(-1); //-1 es al final, si no se incluye de igual manera se agrega al final.
            td.textContent = pendiente.descripcion;
            tr.insertCell().innerHTML = "&vellip"; 
        }
    }
}

actualizar();