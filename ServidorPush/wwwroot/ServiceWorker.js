self.addEventListener("push", function (e) {
    console.log(e.data.json());
});