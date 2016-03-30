self.on("click", function (node, data) {
    self.postMessage(unsafeWindow.mw.config.get("wgRequestId"));
});
