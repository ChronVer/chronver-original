"use strict";
/// <reference path="../@types/types.d.ts" />
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
//  N A T I V E
var fs_1 = require("fs");
//  I M P O R T S
var app_root_path_1 = __importDefault(require("app-root-path"));
var order_object_1 = __importDefault(require("@webb/order-object"));
//  P R O G R A M
var ChronVer = /** @class */ (function() {
  function ChronVer(options) {
    // console.log("——— CONSTRUCT");
    if (!options) return this.initialize();
    var coerce = options.coerce,
      increment = options.increment,
      parse = options.parse,
      version = options.version;
    if (coerce) {
      this.coerce(coerce);
      return this._returnThis();
    }
    if (parse) {
      this.parse(parse);
      return this._returnThis();
    }
    if (increment === "" || (increment === "change" && !version))
      return this.initialize();
    if (!version) this.initialize();
    if (version) this.parse(version);
    if (increment) this.increment(increment);
    return this._returnThis();
  }
  ChronVer.prototype._format = function() {
    // console.log("——— FORMAT");
    var _a = processChange(this.change),
      change = _a.change,
      toIncrement = _a.toIncrement;
    switch (true) {
      case this.year <= 1970:
      case this.month <= 0:
      case this.day <= 0:
      case Number.isNaN(this.year):
      case Number.isNaN(this.month):
      case Number.isNaN(this.day):
        return this.coerce(this.year + "." + this.month + "." + this.day);
      default:
        this.version =
          this.year +
          "." +
          processMonth(this.month) +
          "." +
          processDay(this.day).day +
          (this.__extra || "") +
          (Number(change) && Number(change) > 0 ? "." + change : "");
        this.raw = this.version;
        return this;
    }
  };
  ChronVer.prototype._returnThis = function() {
    delete this.__extra;
    delete this.__increment;
    delete this.__original;
    var self = this;
    return self._sort();
  };
  ChronVer.prototype._sort = function() {
    return order_object_1.default(this);
  };
  ChronVer.prototype.coerce = function(version) {
    // console.log("——— COERCE");
    var regexMatches = version.trim().split(".");
    switch (true) {
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
    var versionYear = +regexMatches[0];
    var versionMonth = +regexMatches[1];
    var versionDay = +regexMatches[2];
    var versionFinal =
      versionYear +
      "." +
      processMonth(versionMonth) +
      "." +
      processDay(versionDay).day;
    this.change = 0;
    this.day = versionDay;
    this.month = versionMonth;
    this.raw = versionFinal;
    this.version = versionFinal;
    this.year = versionYear;
    return this;
  };
  ChronVer.prototype.increment = function(incrementType) {
    // console.log("——— INCREMENT");
    var currentYear = +new Date().getFullYear();
    var currentMonth = +new Date().getMonth() + 1;
    var currentDay = +new Date().getDate();
    var packageFile = null;
    var packageFileData = null;
    var versionChange = null;
    var versionIncrement = null;
    if (!incrementType || incrementType === "package") {
      if (incrementType === "package") {
        packageFile = app_root_path_1.default.resolve("/package.json");
        // https://stackoverflow.com/a/46190552
        packageFileData = JSON.parse(fs_1.readFileSync(packageFile).toString());
        this.__original = packageFileData.version;
        var _a = this.parse(packageFileData.version),
          change = _a.change,
          day = _a.day,
          month = _a.month,
          raw = _a.raw,
          year = _a.year;
        this.change = change;
        this.day = day;
        this.month = month;
        this.year = year;
      }
      switch (true) {
        // Supplied year is less than current year
        // Supplied year is current but supplied month is less than current month
        // Supplied year and month are current but supplied day is less than current day
        case this.year < currentYear:
        case this.year === currentYear && this.month < currentMonth:
        case this.year === currentYear &&
          this.month === currentMonth &&
          this.day < currentDay:
          if (packageFile) {
            packageFileData = JSON.parse(
              fs_1.readFileSync(packageFile).toString()
            );
            packageFileData.version = this.initialize().version;
            // Update version in package.json and make it pretty
            fs_1.writeFileSync(
              packageFile,
              JSON.stringify(packageFileData, null, 2) + "\n"
            );
          }
          return this.initialize(); // Update old version to present
        default:
          break;
      }
    }
    if (incrementType === "change") {
      var _b = processChange(this.version),
        change = _b.change,
        toIncrement = _b.toIncrement;
      versionChange = change;
      versionIncrement = toIncrement;
    }
    if (this.change) versionChange = this.change;
    if (this.__increment) versionIncrement = this.__increment;
    switch (incrementType) {
      case "day":
        if (versionIncrement) this.day = versionIncrement + 1;
        else this.day++;
        break;
      case "month":
        if (versionIncrement) this.month = versionIncrement + 1;
        else this.month++;
        break;
      case "year":
        if (versionIncrement) this.year = versionIncrement + 1;
        else this.year++;
        break;
      case "change":
      case "package":
        if (typeof this.change === "number") this.change++;
        else {
          this.change = [
            versionChange && versionChange > 0 ? versionChange : "",
            versionIncrement && Number(versionIncrement)
              ? versionIncrement + 1
              : ""
          ].join("");
        }
        break;
      default:
        break;
    }
    this.raw = this.version;
    if (Number(this.change)) this.change = Number(this.change);
    this._format();
    if (packageFile) {
      packageFileData.version = this.version;
      // Update version in package.json and make it pretty
      fs_1.writeFileSync(
        packageFile,
        JSON.stringify(packageFileData, null, 2) + "\n"
      );
    }
    return this;
  };
  ChronVer.prototype.initialize = function() {
    // console.log("——— INITIALIZE");
    var versionYear = +new Date().getFullYear();
    var versionMonth = +new Date().getMonth() + 1;
    var versionDay = +new Date().getDate();
    var version =
      versionYear +
      "." +
      processMonth(versionMonth) +
      "." +
      processDay(versionDay).day;
    this.change = 0;
    this.day = versionDay;
    this.month = versionMonth;
    this.raw = version;
    this.version = version;
    this.year = versionYear;
    return this;
  };
  ChronVer.prototype.parse = function(version) {
    // console.log("——— PARSE");
    if (!version) return this.initialize();
    var regexMatches =
      typeof version === "string"
        ? version.trim().split(".")
        : version.version.trim().split(".");
    var _a = processDay(regexMatches[2]),
      day = _a.day,
      extra = _a.extra;
    this.__extra = extra;
    this.year = +regexMatches[0];
    this.month = +regexMatches[1];
    this.day = +day;
    this.raw = regexMatches.join(".");
    this.version = regexMatches.join(".");
    // Ignore first three matches
    for (var step = 0; step < 3; step++) regexMatches.shift();
    if (regexMatches.length > 0) {
      var _b = processChange(regexMatches.join(".")),
        change = _b.change,
        toIncrement = _b.toIncrement;
      this.change = change;
      this.__increment = toIncrement;
    } else {
      this.change = 0;
    }
    return this;
  };
  return ChronVer;
})();
exports.default = ChronVer;
//  H E L P E R S
function processChange(change) {
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
    var changesetIdentifier = String(change).split(/(\.|-|\|)/);
    var lastElement_1 = changesetIdentifier.slice(-1)[0];
    var changesetIdentifierSansLastElement = changesetIdentifier
      .filter(function(arrayItem) {
        return arrayItem !== lastElement_1;
      })
      .join("");
    if (changesetIdentifier.length > 0) {
      if (Number(lastElement_1)) {
        return {
          change: changesetIdentifierSansLastElement,
          toIncrement: Number(lastElement_1)
        };
      } else {
        return {
          change: changesetIdentifierSansLastElement + lastElement_1,
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
exports.processChange = processChange;
function processDay(day) {
  if (typeof day === "number") {
    if (+day === 0) day = 1;
    return {
      day: String(day).length > 1 ? day : "0" + day,
      extra: ""
    };
  } else {
    var arrayWithDay = String(day).split(/(\.|-|\|)/);
    var theDay_1 = arrayWithDay[0];
    var arraySansDay = arrayWithDay
      .filter(function(arrayItem) {
        return arrayItem !== theDay_1;
      })
      .join("");
    return {
      day: theDay_1,
      extra: arraySansDay
    };
  }
}
exports.processDay = processDay;
function processMonth(month) {
  if (+month === 0) month = 1;
  return String(month).length > 1 ? month : "0" + month;
}
exports.processMonth = processMonth;
function valid(version) {
  // console.log("——— VALID");
  var parsedVersion = new ChronVer({ parse: version });
  return parsedVersion ? parsedVersion.version : null;
}
exports.valid = valid;
