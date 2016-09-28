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

const contextmenu = require("sdk/context-menu");
const events = require("sdk/system/events");
const matchpattern = require("sdk/util/match-pattern");
const panel = require("sdk/panel");
const preferences = require("sdk/simple-prefs");
const self = require("sdk/self");
const tabs = require("sdk/tabs");
const timer = require("sdk/timers");
const toggle = require("sdk/ui/button/toggle");
const xpcom = require("./xpcom");
const _ = require("sdk/l10n").get;

var wikiPatterns = [
        "*.mediawiki.org",
        "*.wikibooks.org",
        "*.wikidata.org",
        "*.wikimedia.org",
        "*.wikinews.org",
        "*.wikipedia.org",
        "*.wikiquote.org",
        "*.wikisource.org",
        "*.wikiversity.org",
        "*.wikivoyage.org",
        "*.wiktionary.org",
    ],
    toolsPatterns = [
        "*.tools.wmflabs.org",
        "*.tools-static.wmflabs.org"
    ],
    icons = {
        "active": {
            "16": "./icon_16.png",
            "32": "./icon.png",
            "64": "./icon_64.png"
        },
        "inactive": {
            "16": "./icon_inactive_16.png",
            "32": "./icon_inactive.png",
            "64": "./icon_inactive_64.png"
        }
    },
    debugEnabled = false,
    timerId = null,
    backend = preferences.prefs["backend"],
    profile = preferences.prefs["profile"],
    readonly = preferences.prefs["readonly"],
    log = preferences.prefs["log"],
    timeoutMs = preferences.prefs["timeout"] * 60 * 1000,
    handleDebugEnable = function (state) {
        debugEnabled = state;

        // Automatically disable when timeout expires
        if (timerId) { timer.clearTimeout(timerId); }
        if (debugEnabled) {
            timerId = timer.setTimeout(
                function() { if (debugEnabled) { handleDebugEnable(false); }; },
                timeoutMs
            );
            button.label = _("button_active_label", getHeader());
            button.icon = icons["active"];
        } else {
            button.label = _("button_label");
            button.icon = icons["inactive"];
        }
    },
    getHeader = function () {
        var hdr = "backend=" + backend;
        if (profile) {
            hdr += "; profile"
        }
        if (readonly) {
            hdr += "; readonly"
        }
        if (log) {
            hdr += "; log"
        }
        return hdr;
    },
    button = toggle.ToggleButton({
        id: "wikimedia-debug",
        label: _("button_label"),
        icon: icons["inactive"],
        onChange: function (state) {
            this.state('window', null);
            optionForm.show({
                position: this
            });
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
                debugEnabled,
                preferences.prefs["backend"],
                preferences.prefs["profile"],
                preferences.prefs["readonly"],
                preferences.prefs["log"]
            );
        },
        onHide: function () {
            if (debugEnabled) {
                button.label = _("button_active_label", getHeader());
            }
        }
    }),
    handlePrefChange = function (name) {
        var val = preferences.prefs[name];
        switch(name) {
            case "backend":
                backend = val;
                break;
            case "log":
                log = val;
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
    onModifyRequest = function (event) {
        if (debugEnabled) {
            let httpChannel = xpcom.nsIHttpChannel(event.subject);
            // Check URL against wiki and tools URL patterns
            [].concat.call(wikiPatterns, toolsPatterns).some(
                function (elm, idx, arr) {
                    let m = new matchpattern.MatchPattern(elm);
                    if (m.test(httpChannel.URI.spec)) {
                        httpChannel.setRequestHeader(
                            "X-Wikimedia-Debug", getHeader(), false
                        );
                        return true;
                    }
                }
            );
        }
    },
    menu = [
        contextmenu.Item({
          label: _("menu_logs_label"),
          image: self.data.url("glyphicons-30-notes-2.png"),
          context: [
              contextmenu.PredicateContext(function (ctx) {
                  return debugEnabled;
              }),
              contextmenu.URLContext(wikiPatterns),
          ],
          contentScriptFile: self.data.url("getRequestId.js"),
          onMessage: function (reqid) {
              tabs.open("https://logstash.wikimedia.org/app/kibana#/dashboard/x-debug?_g=(refreshInterval:(display:Off,pause:!f,value:0),time:(from:now-1h,mode:quick,to:now))&_a=(filters:!((%27$state%27:(store:appState),meta:(alias:!n,disabled:!f,index:%27logstash-*%27,key:_type,negate:!f,value:mediawiki),query:(match:(_type:(query:mediawiki))))),options:(darkTheme:!f),panels:!((col:1,id:Events-Over-Time,panelIndex:14,row:1,size_x:12,size_y:2,type:visualization),(col:1,columns:!(level,channel,host,wiki,message),id:MediaWiki-Events-List,panelIndex:15,row:3,size_x:12,size_y:11,sort:!(%27@timestamp%27,desc),type:search)),query:(query_string:(analyze_wildcard:!t,query:%27reqId:%22" + encodeURI(reqid) + "%22%27)),title:x-debug,uiState:())");
          }
      }),
      contextmenu.Item({
          label: _("menu_profile_label"),
          image: self.data.url("glyphicons-332-dashboard.png"),
          context: [
              contextmenu.PredicateContext(function (ctx) {
                  return debugEnabled;
              }),
              contextmenu.URLContext(wikiPatterns),
              contextmenu.PredicateContext(function (ctx) {
                  return profile;
              })
          ],
          contentScriptFile: self.data.url("getRequestId.js"),
          onMessage: function (reqid) {
              tabs.open("https://performance.wikimedia.org/xhgui/?url=" + reqid);
          }
      })
    ];

exports.main = function(options, callbacks) {
    events.on("http-on-modify-request", onModifyRequest);
    preferences.on("", handlePrefChange);
    optionForm.port.on("enable", function (state) {
        handleDebugEnable(state);
    });
    optionForm.port.on("change", function (name, val) {
        preferences.prefs[name] = val;
    });
    optionForm.port.on("resize", function (w, h) {
        optionForm.resize(w, h);
    });
};
exports.onUnload = function(reason) {
    preferences.removeListener("", handlePrefChange);
    events.off("http-on-modify-request", onModifyRequest);
};
