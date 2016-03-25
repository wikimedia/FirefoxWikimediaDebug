var eBackend = document.getElementById("backend"),
    eProfile = document.getElementById("profile"),
    eReadonly = document.getElementById("readonly"),
    eLog = document.getElementById("log"),
    eContainer = document.getElementById("container");

eBackend.addEventListener("change", function (e) {
    self.port.emit("change", "backend", eBackend.value);
}, false);

eProfile.addEventListener("change", function (e) {
    self.port.emit("change", "profile", eProfile.checked);
}, false);

eReadonly.addEventListener("change", function (e) {
    self.port.emit("change", "readonly", eReadonly.checked);
}, false);

eLog.addEventListener("change", function (e) {
    self.port.emit("change", "log", eLog.checked);
}, false);

self.port.on("show", function (backend, profile, readonly, log) {
    eBackend.value = backend;
    eProfile.checked = profile;
    eReadonly.checked = readonly;
    eLog.checked = log;
    self.port.emit("resize", eContainer.scrollWidth, eContainer.scrollHeight);
});

