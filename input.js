"use strict";
/**
 * @module input
 */
Object.defineProperty(exports, "__esModule", { value: true });
const __dgLib = require("@nwps/data-generators/library");
const __dg = require("@nwps/data-generators");
const a = 5;
const t = __dg.struct({ name: __dgLib.bool(), fn: __dgLib.func(__dgLib.int()), a: __dg.constant(5), b: __dgLib.int(), c: __unknown, d: __unknown });
t;
