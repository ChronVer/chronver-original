"use strict"; /* @flow */



//  N A T I V E

const { readFileSync, writeFileSync } = require("fs");

//  P A C K A G E S

const appRoot = require("app-root-path");
const chronverRegex = require("chronver-regex");

//  U T I L S

const MAX_LENGTH = 256;
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

//  E X P O R T S

exports = module.exports = ChronVer;
exports.coerce = coerce;
exports.increment = increment;
exports.initialize = initialize;
exports.parse = parse;
exports.valid = valid;



//  P R O G R A M

function ChronVer(version: string) {
  if (version instanceof ChronVer)
    version = version.version;

  if (typeof version !== "string")
    throw new TypeError(`Invalid version: ${version}`);

  if (version.length > MAX_LENGTH)
    throw new TypeError(`Version is longer than ${MAX_LENGTH} characters`);

  if (!(this instanceof ChronVer))
    return new ChronVer(version);

  this.raw = version;

  const regexMatches = version.trim().match(chronverRegex()) ?
    // $FlowFixMe: I have no idea how to make Flow like this line
    version.trim().match(chronverRegex())[0].split(".") :
    null;

  if (!regexMatches)
    return regexMatches;

  this.year = +regexMatches[0];
  this.month = +regexMatches[1];
  this.day = +regexMatches[2];

  if (!regexMatches[3])
    this.change = 0;
  else
    this.change = +regexMatches[3] || String(regexMatches[3] + version.split(regexMatches[3])[1]);

  if (this.year > MAX_SAFE_INTEGER || this.year < 0)
    throw new TypeError("Invalid year version");

  if (this.month > MAX_SAFE_INTEGER || this.month < 0)
    throw new TypeError("Invalid month version");

  if (this.day > MAX_SAFE_INTEGER || this.day < 0)
    throw new TypeError("Invalid day version");

  if (+this.change > MAX_SAFE_INTEGER || +this.change < 0)
    throw new TypeError("Invalid change version");

  return this._format();
}

ChronVer.prototype._format = function() {
  this.version =
    this.year + "." +
    processMonth(this.month) + "." +
    processDay(this.day) +
    processChange(this.change);

  return this.version;
};

ChronVer.prototype.coerce = function(version: ?string) {
  return coerce(version);
};

ChronVer.prototype.increment = function(incrementType: string) {
  let packageFile = null;

  if (incrementType === "package") {
    packageFile = appRoot.resolve("/package.json");
    // $FlowFixMe: Flow does not like "readFileSync".
    const { change, day, month, raw, year } = parse(JSON.parse(readFileSync(packageFile)).version);

    this.change = change;
    this.day = day;
    this.month = month;
    this.raw = raw;
    this.year = year;
  }

  switch(true) {
    // Supplied year is less than current year
    // Supplied year is current but supplied month is less than current month
    // Supplied year and month are current but supplied day is less than current day
    case this.year < +new Date().getFullYear():
    case this.year === +new Date().getFullYear() && this.month < +new Date().getMonth() + 1:
    case this.year === +new Date().getFullYear() && this.month === +new Date().getMonth() + 1 && this.day < +new Date().getDate():
      return initialize(); // Update old version to present

    default:
      break;
  }

  switch(incrementType) {
    case "day":
      this.day++;
      break;

    case "month":
      this.month++;
      break;

    case "year":
      this.year++;
      break;

    default:
    case "change":
    case "package":
      if (typeof this.change === "number")
        this.change++;
      // TODO: Account for "change" being a string
      break;
  }

  this._format();
  this.raw = this.version;

  if (packageFile) {
    // $FlowFixMe: Flow does not like "readFileSync".
    const packageFileData = JSON.parse(readFileSync(packageFile));

    packageFileData.version = this.version;
    // Update version in package.json and make it pretty
    writeFileSync(packageFile, JSON.stringify(packageFileData, null, 2) + "\r\n");
  }

  return this;
};

ChronVer.prototype.initialize = function() {
  return initialize();
};



//  H E L P E R S

function coerce(version) {
  if (version instanceof ChronVer)
    return version;

  if (typeof version === "number")
    version = String(version);

  if (typeof version !== "string")
    return null;

  const regexMatches = version.trim().split(".");

  let versionYear = +regexMatches[0];
  let versionMonth = +regexMatches[1];
  let versionDay = +regexMatches[2];

  if (versionYear > MAX_SAFE_INTEGER || versionYear < 0)
    versionYear = String(new Date().getFullYear());

  if (versionMonth > MAX_SAFE_INTEGER || versionMonth < 0 || versionMonth > 12)
    versionMonth = String(new Date().getMonth() + 1);

  if (versionDay > MAX_SAFE_INTEGER || versionDay < 0 || versionDay > 31)
    versionDay = String(new Date().getDate());

  return new ChronVer(`${versionYear}.${processMonth(versionMonth)}.${processDay(versionDay)}`);
}

function increment(version, incrementType) {
  try {
    return new ChronVer(version).increment(incrementType).version;
  } catch(error) {
    return null;
  }
}

function initialize() {
  const versionYear = +new Date().getFullYear();
  const versionMonth = processMonth(+new Date().getMonth() + 1);
  const versionDay = processDay(+new Date().getDate());

  return new ChronVer(`${versionYear}.${versionMonth}.${versionDay}`);
}

function parse(version) {
  if (version instanceof ChronVer)
    return version;

  if (typeof version !== "string")
    return null;

  if (version.length > MAX_LENGTH)
    return null;

  if (!chronverRegex().test(version))
    return null;

  try {
    return new ChronVer(version);
  } catch(error) {
    return null;
  }
}

function processChange(change) {
  if (typeof change === "number" && change === 0)
    return "";
  else {
    return String(change).length > 0 ?
      "." + change :
      "";
  }
}

function processDay(day) {
  if (+day === 0)
    day = 1;

  return String(day).length > 1 ?
    day :
    "0" + day;
}

function processMonth(month) {
  if (+month === 0)
    month = 1;

  return String(month).length > 1 ?
    month :
    "0" + month;
}

function valid(version) {
  const parsedVersion = parse(version);

  return parsedVersion ?
    parsedVersion.version :
    null;
}
