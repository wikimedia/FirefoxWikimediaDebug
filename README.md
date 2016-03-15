Wikimedia Debug Header Firefox Add-on
=====================================

This Firefox addon injects a `X-Wikimedia-Debug` header into HTTP requests to
Wikimedia Foundation projects. Requests bearing this header are not cached and
are routed to machines dedicated to debugging where additional logging and/or
profiling is available. See [wikitech] for additional documentation.

There is also a [Chrome version].

Installation
------------

The addon is built using the [Add-on SDK][] from Mozilla.

```
$ jpm xpi
```

Official releases can be installed from [addons.mozilla.org][].

License
-------
Wikimedia Debug Header Firefox Add-on is licensed under the Apache 2.0
license. See the `LICENSE` file for more details.


[wikitech]: https://wikitech.wikimedia.org/wiki/X-Wikimedia-Debug
[Add-on SDK]: https://developer.mozilla.org/en-US/Add-ons/SDK
[addons.mozilla.org]: https://addons.mozilla.org/en-US/firefox/addon/wikimedia-debug-header/
[Chrome version]: https://github.com/wikimedia/ChromeWikimediaDebug
