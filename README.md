# chronver

> The [chronological](https://chronver.org "Official ChronVer website") versioner



## Install

```bash
$ npm i chronver
```

## Usage

### Node.js:

```js
import chronver from "chronver";

chronver("2019.04.03").increment().version; // or
chronver("2019.04.03").increment("change").version;
// => 2019.04.03.1

chronver("2019.04.03").increment("year").version;
// => 2020.04.03

chronver("2019.04.03").increment("month").version;
// => 2019.05.03

chronver("2019.04.03").increment("day").version;
// => 2019.04.03

chronver("").coerce("2019.4.3").version;
// => 2019.04.03

chronver("").initialize().version;
// => The current date in ChronVer format
```

### package.json:

```json
{
  "scripts": {
    "increment": "chronver --increment package"
  }
}
```

This allows you to run `npm run increment` and have your `package.json` version incremented to ChronVer's spec automatically. However if you want to have this happen automatically when committing to a repo, employ [husky](https://github.com/typicode/husky) like so:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run increment && git add -A :/"
    }
  }
}
```

### Command-line interface:

```shell
$ chronver --help

ChronVer 2019.10.27.1

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

        ex. Passing "1970.04.03 -i month" to ChronVer will return the present
        date but passing "3027.04.03 -i month" will return "3027.05.03".

--init --initialize
        Creates a ChronVer string, defaulting to the present.

ChronVer exits upon failure.
```

## Versions

A "version" is described by the specification found at [https://chronver.org](https://chronver.org "Official ChronVer website").

## Note

You may have to set your version to "0000.00.00" prior to initializing ChronVer. This will be fixed an done automatically in a future update.

## License

MIT © [netop://ウエハ](https://webb.page "Homepage of netop://ウエハ")
