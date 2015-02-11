/**
 * Copyright 2015 Ori Livneh <ori@wikimedia.org>
 * Copyright 2015 Bryan Davis <bd808@wikimedia.org>
 * Copyright 2015 Wikimedia Foundation and contributors
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

var button, debug;

exports.main = function(options, callbacks) {
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
            this.state('window', null);
            this.checked = !this.checked;

            // Automatically disable after 5 minutes
            if (this.timerId) { timer.clearTimeout(this.timerId); }
            if (this.checked) {
                this.timerId = timer.setTimeout(
                    function() { if (button.checked) { button.click(); }; },
                    5 * 60 * 1000
                );
            }

            console.info( _("change_log",
                _(this.checked ? "change_enabled" : "change_disabled")
            ));
        },
    });
    button.timerId = null;

    debug = {
        // We intercept requests to FQDNs matching these patterns.
        fqdns: [
            /^www\.mediawiki\.org$/,
            /^([0-9A-Za-z]|-)+\.wikibooks\.org$/,
            /^([0-9A-Za-z]|-)+\.wikidata\.org$/,
            /^([0-9A-Za-z]|-)+\.wikimedia\.org$/,
            /^([0-9A-Za-z]|-)+\.wikinews\.org$/,
            /^([0-9A-Za-z]|-)+\.wikipedia\.org$/,
            /^([0-9A-Za-z]|-)+\.wikiquote\.org$/,
            /^([0-9A-Za-z]|-)+\.wikisource\.org$/,
            /^([0-9A-Za-z]|-)+\.wikiversity\.org$/,
            /^([0-9A-Za-z]|-)+\.wikivoyage\.org$/,
            /^([0-9A-Za-z]|-)+\.wiktionary\.org$/,
        ],

        // Inject header when active.
        observe: function (subject, topic, data) {
            if (topic == "http-on-modify-request" && button.checked ) {
                var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
                var host = httpChannel.URI.host;
                debug.fqdns.every(function(elm, idx, arr){
                    if (elm.test(host)) {
                        httpChannel.setRequestHeader(
                            'X-Wikimedia-Debug', '1', false
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

    debug.register();
};

exports.onUnload = function(reason) {
    debug.unregister();
};
