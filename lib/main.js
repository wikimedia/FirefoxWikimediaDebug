/**
 * Copyright 2016 Ori Livneh <ori@wikimedia.org>
 * Copyright 2016 Bryan Davis <bd808@wikimedia.org>
 * Copyright 2016 Wikimedia Foundation and contributors
 *
 * Licensed under the Apache License, Version 2.0 ( the "License" );
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const { Cc, Ci } = require("chrome");
const { ToggleButton } = require("sdk/ui/button/toggle");
const timer = require("sdk/timers");
const _ = require("sdk/l10n").get;
const preferences = require("sdk/simple-prefs");
const self = require("sdk/self");
const panel = require("sdk/panel");

var timerId = null,
    backend = preferences.prefs["backend"],
    profile = preferences.prefs["profile"],
    readonly = preferences.prefs["readonly"],
    timeoutMs = preferences.prefs["timeout"] * 60 * 1000,
    button = ToggleButton({
        id: "wikimedia-debug",
        label: "Wikimedia Debug Header",
        icon: {
            "16": "./icon_16.png",
            "32": "./icon.png",
            "64": "./icon_64.png",
        },
        onChange: function (state) {
            // track state globally rather than per-window
            this.state("window", null);
            this.checked = !this.checked;

            // Automatically disable when timeout expires
            if (timerId) { timer.clearTimeout(timerId); }
            if (this.checked) {
                optionForm.show({
                    position: this
                });
                timerId = timer.setTimeout(
                    function() { if (this.checked) { this.click(); }; },
                    timeoutMs
                );
            }
        }
    }),
    optionForm = panel.Panel({
        contentURL: self.data.url("options.html"),
        contentScriptFile: self.data.url("options.js"),
        contentStyleFile: self.data.url("options.css"),
        width: 10,
        height: 10,
        onShow: function () {
            optionForm.port.emit("show",
                preferences.prefs["backend"],
                preferences.prefs["profile"],
                preferences.prefs["readonly"]
            );
        }
    }),
    handlePrefChange = function (name) {
        var val = preferences.prefs[name];
        switch(name) {
            case "backend":
                backend = val;
                break;
            case "profile":
                profile = val;
                break;
            case "readonly":
                readonly = val;
                break;
            case "timeout":
                timeoutMs = val * 60 * 1000;
                break;
        }
    },
    debug = {
        // We intercept requests to FQDNs matching these patterns.
        fqdns: [
            /^(.*\.)?mediawiki\.org$/,
            /^(.*\.)?wikibooks\.org$/,
            /^(.*\.)?wikidata\.org$/,
            /^(.*\.)?wikimedia\.org$/,
            /^(.*\.)?wikinews\.org$/,
            /^(.*\.)?wikipedia\.org$/,
            /^(.*\.)?wikiquote\.org$/,
            /^(.*\.)?wikisource\.org$/,
            /^(.*\.)?wikiversity\.org$/,
            /^(.*\.)?wikivoyage\.org$/,
            /^(.*\.)?wiktionary\.org$/,
            /^(tools(-static)?)\.wmflabs\.org$/,
        ],

        // Inject header when active.
        observe: function (subject, topic, data) {
            if (topic == "http-on-modify-request" && button.checked ) {
                var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel),
                    host = httpChannel.URI.host,
                    dbgHeader = "backend=" + backend;
                if (profile) {
                    dbgHeader += "; profile"
                }
                if (readonly) {
                    dbgHeader += "; readonly"
                }
                debug.fqdns.every(function(elm, idx, arr){
                    if (elm.test(host)) {
                        httpChannel.setRequestHeader(
                            "X-Wikimedia-Debug", dbgHeader, false
                        );
                        return false;
                    }
                    return true;
                });
            }
        },

        // Register for http-on-modify-request events
        register: function() {
            var observerService = Cc["@mozilla.org/observer-service;1"]
                .getService(Ci.nsIObserverService);
            observerService.addObserver(debug, "http-on-modify-request", false);
        },

        // Unregister for http-on-modify-request events
        unregister: function() {
            var observerService = Cc["@mozilla.org/observer-service;1"]
                .getService(Ci.nsIObserverService);
            observerService.removeObserver(debug, "http-on-modify-request");
        },
    };

exports.main = function(options, callbacks) {
    debug.register();
    preferences.on("", handlePrefChange);
    optionForm.port.on("change", function (name, val) {
        preferences.prefs[name] = val;
    });
    optionForm.port.on("resize", function (w, h) {
        optionForm.resize(w, h);
    });
};
exports.onUnload = function(reason) {
    preferences.removeListener("", handlePrefChange);
    debug.unregister();
};
