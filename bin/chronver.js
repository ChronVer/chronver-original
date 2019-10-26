#!/usr/bin/env node
// Standalone chronver comparison program.
// Exits successfully and prints matching version(s) if
// any supplied version is valid and passes all tests.



//  U T I L S

const chronver = require("../lib/chronver");
const { version } = require("../package.json");

const argumentValues = process.argv.slice(2);
const range = [];

let coerce = false;
let increment = null;
let initialize = false;
let versions = [];



//  P R O G R A M

main();



//  H E L P E R S

function fail() {
  process.exit(1);
}

function failIncrement() {
  console.error("Incrementing can only happen on a single version");
  fail();
}

function help() {
  console.log(["ChronVer " + version,
    "",
    // "................................................................................", // 80 characters
    "A JavaScript implementation of the https://chronver.org specification",
    "Copyright Paul Anthony Webb",
    "",
    "Usage: chronver [options] <version> [<version> [...]]",
    "Prints valid versions sorted by ChronVer precedence",
    "",
    "Options:",
    "-c --coerce",
    "        Coerce a string into ChronVer if possible.",
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
    "--init --initialize",
    "        Creates a ChronVer string, defaulting to the present.",
    "",
    "Program exits successfully if any valid version satisfies all supplied ranges, and",
    "prints all satisfying versions.",
    "",
    "If no satisfying versions are found, then exits failure."
    // "................................................................................", // 80 characters
  ].join("\n"));
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
    versions.push(chronver.initialize().version);

  versions = versions.map(version => coerce ?
    (chronver.coerce(version) || { version }).version :
    version
  ).filter(version => chronver.valid(version));

  if (!versions.length)
    return fail();

  if (increment && versions.length !== 1)
    return failIncrement();

  for (let i = 0, rangeLength = range.length; i < rangeLength; i++) {
    versions = versions.filter(version => chronver.satisfies(version, range[i]));

    if (!versions.length)
      return fail();
  }

  return success(versions);
}

function success(versions) {
  versions
    .map(version => increment ?
      chronver.increment(version, increment) :
      version
    )
    .forEach(version => {
      console.log(version);
    });
}
