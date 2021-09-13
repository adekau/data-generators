'use strict';
/**
 * @module input
 */
Object.defineProperty(exports, '__esModule', { value: true });
const __dgLib = require('@nwps/data-generators/library');
const __dg = require('@nwps/data-generators');
const t = __dg.struct({
    name: __dg.constant('Bob'),
    age: __dgLib.int(),
    date: __dgLib.date(),
    bool: __dgLib.bool(),
    col: __dg.anyOf(__dg.constant(1), __dg.constant(2)),
    fn: __dgLib.func(__dgLib.bool()),
    und: __dg.constant(undefined)
});
t;
