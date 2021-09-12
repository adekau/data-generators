"use strict";
/**
 * @module input
 */
Object.defineProperty(exports, "__esModule", { value: true });
const __dgLib = require("@nwps/data-generators/library");
const __dg = require("@nwps/data-generators");
class TestClass {
}
const t = __dg.struct({ name: __primitive, age: __primitive, children: __primitive, birthDate: __primitive, something: __dg.struct({ somethingTwo: __primitive }), somethingElse: __primitive }).create();
const t2 = __primitive.create();
const t3 = __primitive.create();
const t4 = __dg.struct({ species: __primitive }).create();
t;
t2;
t3;
t4;
