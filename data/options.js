var eEnabled = document.getElementById("enabled"),
    eBackend = document.getElementById("backend"),
    eProfile = document.getElementById("profile"),
    eReadonly = document.getElementById("readonly"),
    eLog = document.getElementById("log"),
    eContainer = document.getElementById("container");

eEnabled.addEventListener("change", function (e) {
    self.port.emit("enable", eEnabled.checked);
}, false);

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

self.port.on("show", function (enabled, backend, profile, readonly, log) {
    eEnabled.checked = enabled;
    eBackend.value = backend;
    eProfile.checked = profile;
    eReadonly.checked = readonly;
    eLog.checked = log;
    self.port.emit("resize", eContainer.scrollWidth, eContainer.scrollHeight);
});

