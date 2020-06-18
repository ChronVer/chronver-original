# chronver

> The [chronological](https://chronver.org "Official ChronVer website") versioner.



## Install

```sh
$ npm i chronver
```

## Requirements

`@chronver/regex` is an evergreen module. 🌲 This module requires an [Active LTS](https://github.com/nodejs/Release) Node version (v12.0.0+).



## Usage
### Node.js

```js
import chronver from "chronver";

new chronver({ increment: "change", version: "2030.04.03" }).version;
// ^ Returns 2030.04.03.1

new chronver({ increment: "year", version: "2030.04.03" }).version;
// ^ Returns 2031.04.03

new chronver({ increment: "month", version: "2030.04.03" }).version;
// ^ Returns 2030.05.03

new chronver({ increment: "day", version: "2030.04.03" }).version;
// ^ Returns 2030.04.04

new chronver({ coerce: "2030.4.3" }).version;
// ^ Returns 2030.04.03

new chronver().version;
// ^ Returns the current date in ChronVer format
```

```js
// Here is how a full response looks
ChronVer {
  change: 0,
  day: 3,
  month: 4,
  raw: "2030.04.03",
  version: "2030.04.03",
  year: 2030
}
```

### package.json:

```json
{
  "scripts": {
    "increment": "chronver --increment package"
  }
}
```

This allows you to run `npm run increment` and have your `package.json` version incremented to ChronVer's spec. However if you want to have this happen automatically when committing to a repo, employ [husky](https://github.com/typicode/husky) like so:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run increment && git add -A :/"
    }
  }
}
```



## API
### new chronver({ coerce?, increment?, parse?, version? })

ChronVer must be instantiated with the `new` keyword.

#### coerce

Type: `string` (optional)

- Given a string that represents a date, `coerce` will attempt to format it into a ChronVer object.
- If supplied value is blank (""), a ChronVer object representing today's date will be returned.

#### increment

Type: `string` (optional)

- Intended for use with the `version` parameter.
- Available options:
  - `change`: increments supplied `version`...version by one.
  - `day`: increments supplied `version` year by one.
  - `month`: increments supplied `version` year by one.
  - `year`: increments supplied `version` year by one.
- If supplied value is blank (""):
- If `version` parameter is not supplied along with an `increment` option:
- If supplied value is in the past:
  - A ChronVer object representing today's date will be returned.

#### parse

Type: `string` | `CVType` (optional)

- Given a string that represents a date (or a ChronVer object), `parse` will test the validity of it and return a formatted ChronVer object.
- If supplied value is blank (""), a ChronVer object representing today's date will be returned.

#### version

- When used alone, behaves like `parse`.



### CLI

```shell
       __
      / /
 ____/ /  _______  _____  __________
/ __/ _ \/ __/ _ \/ _ | |/ / -_/ __/
\__/_//_/_/  \___/_//_|___/\__/_/

A JavaScript implementation of the https://chronver.org specification
Copyright © netop://ウエハ (Paul Anthony Webb)

Usage: chronver [options] <version>
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



Examples:
$ chronver --initialize
$ chronver --increment month 2030.03.03
$ chronver --increment package
```



## Tests

You will need to first download this repo, `cd` into it, and `npm i` before proceeding further.

```sh
# Run all tests, sequentially
$ npm test

# Test dependencies for latest versions
$ npm run test:dependencies

# Lint "bin" and "lib" directories
$ npm run test:typescript

# Run this module through its paces
# PLEASE run this so I can feel my time writing and troubleshooting these tests were worth it
$ npm run test:assert
```



## License

MIT © [netop://ウエハ](https://webb.page "Homepage of netop://ウエハ")
