var eBackend = document.getElementById("backend"),
    eWrapper = document.getElementById("wrapper");

eBackend.addEventListener("input", function (e) {
    self.port.emit("change", "backend", eBackend.value);
}, false);

self.port.on("show", function (backend) {
    eBackend.value = backend;
    self.port.emit("resize", eWrapper.scrollWidth, eWrapper.scrollHeight);
});

