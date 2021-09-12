"use strict";
/**
 * @module input
 */
Object.defineProperty(exports, "__esModule", { value: true });
const __dgLib = require("@nwps/data-generators/library");
const __dg = require("@nwps/data-generators");
class TestClass {
}
const t = __dg.struct({ name: __dgLib.string(), age: __dgLib.int(), children: __dgLib.int(), birthDate: __dgLib.date(), something: __dg.struct({ somethingTwo: __dgLib.string() }), somethingElse: __dg.constant(5) }).create();
const t2 = __dgLib.int().create();
const t3 = __dgLib.date().create();
const t4 = __dg.struct({ species: __dgLib.string() }).create();
t;
t2;
t3;
t4;
