/// <reference path="../@types/types.d.ts" />



//  N A T I V E

import { readFileSync, writeFileSync } from "fs";

//  I M P O R T S

import appRoot from "app-root-path";
import orderObject from "@webb/order-object";

//  U T I L S

type ChronVerInput = {
  coerce?: string;
  increment?: string;
  parse?: string;
  version?: string;
};

type CVType = {
  change: number | string;
  day: number;
  month: number;
  raw: string;
  version: string;
  year: number;
};



//  P R O G R A M

export default class ChronVer {
  change!: number | string;
  day!: number;
  month!: number;
  raw!: string;
  version!: string;
  year!: number;

  // These parameters are not included in final response
  __extra!: string;
  __increment!: number | null;
  __original!: string;

  constructor(options?: ChronVerInput) {
    // console.log("——— CONSTRUCT");

    if (!options)
      return this.initialize();

    const { coerce, increment, parse, version } = options;

    if (coerce) {
      this.coerce(coerce);
      return this._returnThis();
    }

    if (parse) {
      this.parse(parse);
      return this._returnThis();
    }

    if (increment === "" || increment === "change" && !version)
      return this.initialize();

    if (!version)
      this.initialize();

    if (version)
      this.parse(version);

    if (increment)
      this.increment(increment);

    return this._returnThis();
  }

  _format() {
    // console.log("——— FORMAT");

    const { change, toIncrement } = processChange(this.change);

    switch(true) {
      case this.year <= 1970:
      case this.month <= 0:
      case this.day <= 0:
      case Number.isNaN(this.year):
      case Number.isNaN(this.month):
      case Number.isNaN(this.day):
        return this.coerce(`${this.year}.${this.month}.${this.day}`);

      default:
        this.version =
          this.year + "." +
          processMonth(this.month) + "." +
          processDay(this.day).day +
          (this.__extra || "") +
          (Number(change) && Number(change) > 0 ? `.${change}` : "");

        this.raw = this.version;
        return this;
    }
  }

  _returnThis() {
    delete this.__extra;
    delete this.__increment;
    delete this.__original;

    const self: { [index: string]: any } = this;
    return self._sort();
  }

  _sort() {
    return orderObject(this);
  }

  coerce(version: string) {
    // console.log("——— COERCE");

    const regexMatches = version.trim().split(".");

    switch(true) {
      // Do not bother with B.S. inputs...
      case regexMatches.length !== 3:
      case String(+regexMatches[0]).length !== 4:
      case +regexMatches[0] <= 0:
      case +regexMatches[1] <= 0:
      case +regexMatches[2] <= 0:
        return this.initialize();

      default:
        break;
    }

    const versionYear = +regexMatches[0];
    const versionMonth = +regexMatches[1];
    const versionDay = +regexMatches[2];
    const versionFinal = `${versionYear}.${processMonth(versionMonth)}.${processDay(versionDay).day}`;

    this.change = 0;
    this.day = versionDay;
    this.month = versionMonth;
    this.raw = versionFinal;
    this.version = versionFinal;
    this.year = versionYear;

    return this;
  }

  increment(incrementType?: string) {
    // console.log("——— INCREMENT");

    const currentYear = +new Date().getFullYear();
    const currentMonth = +new Date().getMonth() + 1;
    const currentDay = +new Date().getDate();

    let packageFile = null;
    let packageFileData = null;
    let versionChange = null;
    let versionIncrement = null;

    if (!incrementType || incrementType === "package") {
      if (incrementType === "package") {
        packageFile = appRoot.resolve("/package.json");
        // https://stackoverflow.com/a/46190552
        packageFileData = JSON.parse(readFileSync(packageFile).toString());
        this.__original = packageFileData.version;

        const { change, day, month, raw, year } = this.parse(packageFileData.version);

        this.change = change;
        this.day = day;
        this.month = month;
        this.year = year;
      }

      switch(true) {
        // Supplied year is less than current year
        // Supplied year is current but supplied month is less than current month
        // Supplied year and month are current but supplied day is less than current day
        case this.year < currentYear:
        case this.year === currentYear && this.month < currentMonth:
        case this.year === currentYear && this.month === currentMonth && this.day < currentDay:
          if (packageFile) {
            packageFileData = JSON.parse(readFileSync(packageFile).toString());
            packageFileData.version = this.initialize().version;
            // Update version in package.json and make it pretty
            writeFileSync(packageFile, JSON.stringify(packageFileData, null, 2) + "\n");
          }

          return this.initialize(); // Update old version to present

        default:
          break;
      }
    }

    if (incrementType === "change") {
      const { change, toIncrement } = processChange(this.version);

      versionChange = change;
      versionIncrement = toIncrement;
    }

    if (this.change)
      versionChange = this.change;

    if (this.__increment)
      versionIncrement = this.__increment;

    switch(incrementType) {
      case "day":
        if (versionIncrement)
          this.day = versionIncrement + 1;
        else
          this.day++;

        break;

      case "month":
        if (versionIncrement)
          this.month = versionIncrement + 1;
        else
          this.month++;

        break;

      case "year":
        if (versionIncrement)
          this.year = versionIncrement + 1;
        else
          this.year++;

        break;

      case "change":
      case "package":
        if (typeof this.change === "number")
          this.change++;
        else {
          this.change = [
            versionChange && versionChange > 0 ?
              versionChange :
              "",
            versionIncrement && Number(versionIncrement) ?
              (versionIncrement + 1) :
              ""
          ].join("")
        }

        break;

      default:
        break;
    }

    this.raw = this.version;

    if (Number(this.change))
      this.change = Number(this.change);

    this._format();

    if (packageFile) {
      packageFileData.version = this.version;
      // Update version in package.json and make it pretty
      writeFileSync(packageFile, JSON.stringify(packageFileData, null, 2) + "\n");
    }

    return this;
  }

  initialize() {
    // console.log("——— INITIALIZE");

    const versionYear = +new Date().getFullYear();
    const versionMonth = +new Date().getMonth() + 1;
    const versionDay = +new Date().getDate();
    const version = `${versionYear}.${processMonth(versionMonth)}.${processDay(versionDay).day}`;

    this.change = 0;
    this.day = versionDay;
    this.month = versionMonth;
    this.raw = version;
    this.version = version;
    this.year = versionYear;

    return this;
  }

  parse(version: CVType | string) {
    // console.log("——— PARSE");

    if (!version)
      return this.initialize();

    const regexMatches = typeof version === "string" ?
      version.trim().split(".") :
      version.version.trim().split(".");
    const { day, extra } = processDay(regexMatches[2]);

    this.__extra = extra;
    this.year = +regexMatches[0];
    this.month = +regexMatches[1];
    this.day = +day;
    this.raw = regexMatches.join(".");
    this.version = regexMatches.join(".");

    // Ignore first three matches
    for (let step = 0; step < 3; step++)
      regexMatches.shift();

    if (regexMatches.length > 0) {
      const { change, toIncrement } = processChange(regexMatches.join("."));

      this.change = change;
      this.__increment = toIncrement;
    } else {
      this.change = 0;
    }

    return this;
  }
}



//  H E L P E R S

export function processChange(change: number | string) {
  // console.log("——— CHANGE");

  if (typeof change === "number") {
    if (change === 0) {
      return {
        change: "",
        toIncrement: null
      };
    } else {
      return {
        change: String(change).length > 0 ? change : "",
        toIncrement: null
      };
    }
  } else if (change && change.length > 0) {
    const changesetIdentifier = String(change).split(/(\.|-|\|)/);
    let lastElement = changesetIdentifier.slice(-1)[0];
    const changesetIdentifierSansLastElement = changesetIdentifier.filter(arrayItem => arrayItem !== lastElement).join("");

    if (changesetIdentifier.length > 0) {
      if (Number(lastElement)) {
        return {
          change: changesetIdentifierSansLastElement,
          toIncrement: Number(lastElement)
        };
      } else {
        return {
          change: changesetIdentifierSansLastElement + lastElement,
          toIncrement: null
        };
      }
    } else {
      return {
        change: 0,
        toIncrement: null
      };
    }
  } else {
    return {
      change: 0,
      toIncrement: null
    };
  }
}

export function processDay(day: number | string) {
  if (typeof day === "number") {
    if (+day === 0)
      day = 1;

    return {
      day: String(day).length > 1 ? day : "0" + day,
      extra: ""
    };
  } else {
    const arrayWithDay = String(day).split(/(\.|-|\|)/);
    const theDay = arrayWithDay[0];
    const arraySansDay = arrayWithDay.filter(arrayItem => arrayItem !== theDay).join("");

    return {
      day: theDay,
      extra: arraySansDay
    };
  }
}

export function processMonth(month: number) {
  if (+month === 0)
    month = 1;

  return String(month).length > 1 ?
    month :
    "0" + month;
}

export function valid(version: string) {
  // console.log("——— VALID");

  const parsedVersion: CVType = new ChronVer({ parse: version });

  return parsedVersion ?
    parsedVersion.version :
    null;
}
