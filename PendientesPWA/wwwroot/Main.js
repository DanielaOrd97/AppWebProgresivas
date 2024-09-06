let menu = document.querySelector(".flotante");
let main = document.querySelector("main");

if (menu) {
    document.addEventListener("click", function (e) {
        if (e.target.tagName == "TD" && e.target == e.target.parentElement.lastElementChild) {
            e.target.append(menu);
        }
       else  if (menu.parentElement != main && e.target.parentElement != menu) {
            main.append(menu);
        }
    });
}