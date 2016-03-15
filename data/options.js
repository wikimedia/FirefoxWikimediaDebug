var eBackend = document.getElementById("backend"),
    eProfile = document.getElementById("profile"),
    eReadonly = document.getElementById("readonly"),
    eContainer = document.getElementById("container");

eBackend.addEventListener("input", function (e) {
    self.port.emit("change", "backend", eBackend.value);
}, false);

eProfile.addEventListener("change", function (e) {
    self.port.emit("change", "profile", eProfile.checked);
}, false);

eReadonly.addEventListener("change", function (e) {
    self.port.emit("change", "readonly", eReadonly.checked);
}, false);

self.port.on("show", function (backend, profile, readonly) {
    eBackend.value = backend;
    eProfile.checked = profile;
    eReadonly.checked = readonly;
    self.port.emit("resize", eContainer.scrollWidth, eContainer.scrollHeight);
});

