# chronver

> The [chronological](https://chronver.org "Official ChronVer website") versioner



## Install

```bash
$ npm i chronver
```

## Usage

Node.js:

```js
import chronver from "chronver";

chronver("2019.10.26").increment().version;
// => 2019.10.26.1

chronver("2019.10.26").increment("year").version;
// => 2020.10.26

chronver("2019.10.26").increment("month").version;
// => 2019.11.26

chronver("2019.10.26").increment("day").version;
// => 2019.10.27

chronver("").coerce("2019.1.6").version;
// => 2019.01.06

chronver("").initialize().version;
// => The current date in ChronVer format
```

Command-line interface:

```shell
$ chronver --help

ChronVer 2019.10.26.7

A JavaScript implementation of the https://chronver.org specification
Copyright © netop://ウエハ (Paul Anthony Webb)

Usage: chronver [options] <version> [<version> [...]]
Prints valid ChronVer versions

Options:
-c --coerce
        Coerce a string into ChronVer if possible, silently fail otherwise.

-? -h --help
        Show this help message.

-i --inc --increment [<level>]
        Increment a version by the specified level. Level can be one of: year,
        month, day, or change. Default level is "change".

        Only one version may be specified.

        The version returned will always default to the present. However,
        supplied versions with a future date will remain in the future.

        ex. Passing "1970.01.01 -i month" to ChronVer will return the present
        date but passing "3027.04.03 -i month" will return "3027.05.03".

--init --initialize
        Creates a ChronVer string, defaulting to the present.

ChronVer exits upon failure.
```

## Versions

A "version" is described by the specification found at [https://chronver.org](https://chronver.org "Official ChronVer website").

## License

MIT © [netop://ウエハ](https://webb.page "Homepage of netop://ウエハ")
