/// <reference path="../@types/types.d.ts" />
declare type ChronVerInput = {
  coerce?: string;
  increment?: string;
  parse?: string;
  version?: string;
};
declare type CVType = {
  change: number | string;
  day: number;
  month: number;
  raw: string;
  version: string;
  year: number;
};
export default class ChronVer {
  change: number | string;
  day: number;
  month: number;
  raw: string;
  version: string;
  year: number;
  __extra: string;
  __increment: number | null;
  __original: string;
  constructor(options?: ChronVerInput);
  _format(): this;
  _returnThis(): any;
  _sort(): any;
  coerce(version: string): this;
  increment(incrementType?: string): this;
  initialize(): this;
  parse(version: CVType | string): this;
}
export declare function processChange(
  change: number | string
):
  | {
      change: string | number;
      toIncrement: null;
    }
  | {
      change: string;
      toIncrement: number;
    };
export declare function processDay(
  day: number | string
): {
  day: string | number;
  extra: string;
};
export declare function processMonth(month: number): string | number;
export declare function valid(version: string): string | null;
export {};
