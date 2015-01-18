Firefox Wikimedia Debug Add-on
=============================+

This Firefox addon injects an `X-Wikimedia-Debug` header into HTTP requests to
Wikimedia Foundation projects. Requests bearing this header are not cached and
are all handled by a single machine.

Installation
------------

The addon is built using the [Add-on SDK]() from Mozilla.

```
$ cfx xpi
```

Running tests
-------------

```
$ cfx test
```

License
-------
Firefox Wikimedia Debug Add-on is licensed under the Apache 2.0 license. See
the `LICENSE` file for more details.


[Add-on SDK]: https://developer.mozilla.org/en-US/Add-ons/SDK
