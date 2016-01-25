Wikimedia Debug Header Firefox Add-on
=====================================

This Firefox addon injects a `X-Wikimedia-Debug` header into HTTP requests to
Wikimedia Foundation projects. Requests bearing this header are not cached and
are all handled by a single machine.

There is also a [Chrome version](https://github.com/wikimedia/ChromeWikimediaDebug).

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


[Add-on SDK]: https://developer.mozilla.org/en-US/Add-ons/SDK
[addons.mozilla.org]: https://addons.mozilla.org/en-US/firefox/addon/wikimedia-debug-header/
