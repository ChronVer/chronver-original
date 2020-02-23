


//  N A T I V E

import assert from "assert";
import path from "path";
import { readFileSync, writeFileSync } from "fs";

//  I M P O R T

import Test from "@webb/test";

//  U T I L S

import chronver from "../lib/index.js";
import { processChange, processDay, processMonth } from "../lib/index.js";



//  T E S T S

const chronverPrototype = Object.getPrototypeOf(new chronver());
const test = Test("chronver");

// INITIALIZE
// If ChronVer is passed no options
// If ChronVer is only passed "increment" and that value is blank
// If ChronVer is passed "increment: 'change'" and "version" is blank

// console.log(new chronver());
// console.log(new chronver({ increment: "" }));
// console.log(new chronver({ increment: "change" }));
// console.log(new chronver({ increment: "change", version: "" }));

const test1versionYear = +new Date().getFullYear();
const test1versionMonth = +new Date().getMonth() + 1;
const test1versionDay = +new Date().getDate();
const test1version = `${test1versionYear}.${processMonth(test1versionMonth)}.${processDay(test1versionDay).day}`;

const todaysVersion = Object.setPrototypeOf({
  change: 0,
  day: test1versionDay,
  month: test1versionMonth,
  raw: test1version,
  version: test1version,
  year: test1versionYear
}, chronverPrototype);

test("ChronVer initialized with no options", () => {
  assert.deepStrictEqual(new chronver(), todaysVersion);
});

test("ChronVer initialized with increment option (empty value)", () => {
  const options = { increment: "" };
  assert.deepStrictEqual(new chronver(options), todaysVersion);
});

test("ChronVer initialized with increment option ('change' value)", () => {
  const options = { increment: "change" };
  assert.deepStrictEqual(new chronver(options), todaysVersion);
});

test("ChronVer initialized with increment ('change' value) and version (empty value) options", () => {
  const options = { increment: "change", version: "" };
  assert.deepStrictEqual(new chronver(options), todaysVersion);
});



// CHANGE
// console.log(new chronver({ increment: "change", version: "2020.04.03" }));
// ^ Returns 2020.04.04.1

// console.log(new chronver({ increment: "day", version: "2020.04.03" }));
// ^ Returns 2020.04.04

// console.log(new chronver({ increment: "month", version: "2020.04.03" }));
// ^ Returns 2020.05.03

// console.log(new chronver({ increment: "year", version: "2020.04.03" }));
// ^ Returns 2021.04.03

// console.log(new chronver({ increment: "day" }));
// ^ Returns tomorrrow

// console.log(new chronver({ increment: "month" }));
// ^ Returns today, next month

// console.log(new chronver({ increment: "year" }));
// ^ Returns today, next year

const test2versionYear = +new Date().getFullYear() + 1;
// ^ We set the year in the future to make these tests evergreen
const test2versionMonth = 4;
const test2versionDay = 3;
const test2versionChange = 0;
const test2options = {
  version: `${test2versionYear}.04.03`
};

test("ChronVer increments version by 'change'", () => {
  const expectedVersion = [
    test2versionYear + ".",
    processMonth(test2versionMonth) + ".",
    processDay(test2versionDay).day + ".",
    test2versionChange + 1
  ].join("");

  const expectedResponse = Object.setPrototypeOf({
    change: test2versionChange + 1,
    day: test2versionDay,
    month: test2versionMonth,
    raw: expectedVersion,
    version: expectedVersion,
    year: test2versionYear
  }, chronverPrototype);

  const options = { ...test2options, increment: "change" };

  assert.deepStrictEqual(new chronver(options), expectedResponse);
});

test("ChronVer increments version by 'day'", () => {
  const expectedVersion = [
    test2versionYear + ".",
    processMonth(test2versionMonth) + ".",
    processDay(test2versionDay + 1).day,
  ].join("");

  const expectedResponse = Object.setPrototypeOf({
    change: test2versionChange,
    day: test2versionDay + 1,
    month: test2versionMonth,
    raw: expectedVersion,
    version: expectedVersion,
    year: test2versionYear
  }, chronverPrototype);

  const options = { ...test2options, increment: "day" };

  assert.deepStrictEqual(new chronver(options), expectedResponse);
});

test("ChronVer increments version by 'month'", () => {
  const expectedVersion = [
    test2versionYear + ".",
    processMonth(test2versionMonth + 1) + ".",
    processDay(test2versionDay).day,
  ].join("");

  const expectedResponse = Object.setPrototypeOf({
    change: test2versionChange,
    day: test2versionDay,
    month: test2versionMonth + 1,
    raw: expectedVersion,
    version: expectedVersion,
    year: test2versionYear
  }, chronverPrototype);

  const options = { ...test2options, increment: "month" };

  assert.deepStrictEqual(new chronver(options), expectedResponse);
});

test("ChronVer increments version by 'year'", () => {
  const expectedVersion = [
    test2versionYear + 1 + ".",
    processMonth(test2versionMonth) + ".",
    processDay(test2versionDay).day,
  ].join("");

  const expectedResponse = Object.setPrototypeOf({
    change: test2versionChange,
    day: test2versionDay,
    month: test2versionMonth,
    raw: expectedVersion,
    version: expectedVersion,
    year: +new Date().getFullYear() + 2
  }, chronverPrototype);

  const options = { ...test2options, increment: "year" };

  assert.deepStrictEqual(new chronver(options), expectedResponse);
});



// CHANGE
// console.log(new chronver({ increment: "change", version: "2020.04.03-super-ui-enhance" }));
// ^ Returns 2020.04.03-super-ui-enhance.1

// console.log(new chronver({ increment: "change", version: "2020.05.08-super-ui-enhance.42" }));
// ^ Returns 2020.05.08.14-super-ui-enhance.43

test("ChronVer increments version with fresh feature branch by 'change'", () => {
  const expectedVersion = [
    test2versionYear + ".",
    processMonth(test2versionMonth) + ".",
    processDay(test2versionDay).day + "-",
    "super-ui-enhance" + ".", 1
  ].join("");

  const { change, toIncrement } = processChange(expectedVersion);

  const expectedResponse = Object.setPrototypeOf({
    change: test2versionChange + 1,
    day: test2versionDay,
    month: test2versionMonth,
    raw: expectedVersion,
    version: expectedVersion,
    year: test2versionYear
  }, chronverPrototype);

  const options = {
    increment: "change",
    version: `${test2versionYear}.04.03-super-ui-enhance`
  };

  assert.deepStrictEqual(new chronver(options), expectedResponse);
});

test("ChronVer increments version with feature branch by 'change'", () => {
  const expectedVersion = [
    test2versionYear + ".",
    processMonth(test2versionMonth) + ".",
    processDay(test2versionDay).day + "-",
    "super-ui-enhance" + ".42"
  ].join("");

  const { change, toIncrement } = processChange(expectedVersion);

  const expectedResponse = Object.setPrototypeOf({
    change: 42,
    day: test2versionDay,
    month: test2versionMonth,
    raw: expectedVersion,
    version: expectedVersion,
    year: test2versionYear
  }, chronverPrototype);

  const options = {
    increment: "change",
    version: `${test2versionYear}.04.03-super-ui-enhance.41`
  };

  assert.deepStrictEqual(new chronver(options), expectedResponse);
});



// PACKAGE
// console.log(new chronver({ increment: "package" }));
// ^ Same as "change" but also writes file

test("ChronVer increments version by 'package'", async() => {
  const pathToPackage = path.join(process.cwd(), "package.json");

  // Save original package.json data
  const originalPackageData = JSON.parse(readFileSync(pathToPackage).toString());

  // Initialize ChronVer
  new chronver({ increment: "package" });

  // Get updated package.json data
  const newPackageData = JSON.parse(readFileSync(pathToPackage).toString());

  // Ensure ChronVer initialized package
  assert.notStrictEqual(originalPackageData.version, newPackageData.version);

  // Revert package version back to original value
  newPackageData.version = originalPackageData.version;
  writeFileSync(pathToPackage, JSON.stringify(newPackageData, null, 2) + "\n");
});



// COERCE
// console.log(new chronver({ coerce: "" }));
// ^ Returns today's date

// console.log(new chronver({ coerce: "1988.4.3" }));
// ^ Returns "1988.04.03"

test("ChronVer initialized with coerce option (empty value)", () => {
  const options = { coerce: "" };
  assert.deepStrictEqual(new chronver(options), todaysVersion);
});

test("ChronVer coerces a date to the correct format", () => {
  const expectedVersion = "1988.04.03";

  const expectedResponse = Object.setPrototypeOf({
    change: 0,
    day: 3,
    month: 4,
    raw: expectedVersion,
    version: expectedVersion,
    year: 1988
  }, chronverPrototype);

  const options = { coerce: "1988.4.3" };

  assert.deepStrictEqual(new chronver(options), expectedResponse);
});

test("ChronVer coerces a malformed date to current date", () => {
  const options = { coerce: "-988.4.3" };
  assert.deepStrictEqual(new chronver(options), todaysVersion);
});



test.run();
