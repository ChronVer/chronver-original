#!/usr/bin/env node
// Standalone chronver comparison program.
// Exits successfully and prints matching version(s) if
// any supplied version is valid and passes all tests.



//  U T I L S

import chronver from "../lib";
import { valid } from "../lib";
import { version } from "../package.json";

const argumentValues = process.argv.slice(2);

let coerce = false;
let increment: any = "";
let initialize = false;
let versions: any[] = [];

const asciiArt = [
  "       __\n",
  `      / /              ${new chronver({ coerce: version }).version}\n`,
  " ____/ /  _______  _____  __________\n",
  "/ __/ _ \\/ __/ _ \\/ _ | |/ / -_/ __/\n",
  "\\__/_//_/_/  \\___/_//_|___/\\__/_/\n"
].join("");



//  P R O G R A M

main();



//  H E L P E R S

function fail() {
  process.exit(1);
}

function failIncrement() {
  process.stdout.write("Incrementing can only happen on a single version");
  fail();
}

function help() {
  process.stdout.write([
    // "................................................................................", // 80 characters
    asciiArt,
    "A JavaScript implementation of the https://chronver.org specification",
    "Copyright © netop://ウエハ (Paul Anthony Webb)",
    "",
    "Usage: chronver [options] <version>",
    "Prints valid ChronVer versions",
    "",
    "Options:",
    "-c --coerce",
    "        Coerce a string into ChronVer if possible, silently fail otherwise.",
    "",
    "-? -h --help",
    "        Show this help message.",
    "",
    "-i --inc --increment [<level>]",
    "        Increment a version by the specified level. Level can be one of: year,",
    "        month, day, or change. Default level is \"change\".",
    "",
    "        Only one version may be specified.",
    "",
    "        The version returned will always default to the present. However,",
    "        supplied versions with a future date will remain in the future.",
    "",
    "        ex. Passing \"1970.04.03 -i month\" to ChronVer will return the present",
    "        date but passing \"3027.04.03 -i month\" will return \"3027.05.03\".",
    "",
    "--init --initialize",
    "        Creates a ChronVer string, defaulting to the present.",
    "",
    "ChronVer exits upon failure.",
    "",
    "",
    "",
    "Examples:",
    "$ chronver --initialize",
    "$ chronver --increment month 2030.03.03",
    "$ chronver --increment package",
    ""
    // "................................................................................", // 80 characters
  ].join("\n"));

  process.exit(0);
}

function main() {
  if (!argumentValues.length)
    return help();

  while(argumentValues.length) {
    const argument = argumentValues.shift();

    switch(argument) {
      case "-c":
      case "--coerce":
        coerce = true;
        break;

      case "-?":
      case "-h":
      case "--help":
        return help();

      case "-i":
      case "--inc":
      case "--increment":
        switch(argumentValues[0]) {
          case "change":
          case "day":
          case "month":
          case "package":
          case "year":
            increment = argumentValues.shift();
            break;

          default:
            increment = "change";
            break;
        }

        break;

      case "--init":
      case "--initialize":
        initialize = true;
        break;

      default:
        versions.push(argument);
        break;
    }
  }

  if (initialize)
    versions.push(new chronver());

  versions = versions.map(version => coerce ?
    new chronver({ coerce: version }).version :
    version
  ).filter(version => valid(version));

  if (increment === "package")
    return new chronver({ increment: "package" });

  if (!versions.length)
    return fail();

  if (increment && versions.length !== 1)
    return failIncrement();

  return success(versions);
}

function success(versions: any) {
  return versions
    .map((version: any) => increment ? new chronver({ increment, version }) : version)
    .forEach((version: any) => version);
}
