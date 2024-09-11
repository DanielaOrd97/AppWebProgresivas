let form = document.querySelector("form");
let btn = document.getElementById("agregar");
let lblerror = document.querySelector(".error");


btn.addEventListener("click", async function (e) {
    let descr = form.elements["descripcion"]; //form elements solo con name.
    if (form.checkValidity()) {
        lblerror.textContent = ""; //Luego limpiar.
        let json = { descripcion: descr.value }  //objeto que se envia con la peticion.
        //fecth para enviar la peticion (async).
        let result = await fetch("api/Pendientes",
            {
                method = "post",
                body: JSON.stringify(json), //convierte a string el objeto.
                headers: {
                    "Content-Type": "application/json"
                }
            },
            
        );

        if (result.ok) {
            window.location.replace("/index");
        }
        else if (result.status == 400) {
            //bad request
            lblerror.textContent = "Verifique la informacion"; 
        }
    }
    else {
        form.reportValidity();
    }
});