"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toMongoDottedObject;

var _mongoose = require("mongoose");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const ObjectId = _mongoose.Types.ObjectId;
/**
 * Convert object to dotted-key/value pair
 * { a: { b: { c: 1 }}} ->  { 'a.b.c': 1 }
 * { a: { $in: [ 1, 2, 3] }} ->  { 'a': { $in: [ 1, 2, 3] } }
 * { a: { b: { $in: [ 1, 2, 3] }}} ->  { 'a.b': { $in: [ 1, 2, 3] } }
 * Usage:
 *   var dotObject(obj)
 *   or
 *   var target = {}; dotObject(obj, target)
 *
 * @param {Object} obj source object
 * @param {Object} target target object
 * @param {Array} path path array (internal)
 */

function toMongoDottedObject(obj, target = {}, path = []) {
  const objKeys = Object.keys(obj);
  /* eslint-disable */

  objKeys.forEach(key => {
    if (key.startsWith('$')) {
      if (path.length === 0) {
        target[key] = obj[key];
      } else {
        target[path.join('.')] = _objectSpread({}, target[path.join('.')], {
          [key]: obj[key]
        });
      }
    } else if (Object(obj[key]) === obj[key] && !(obj[key] instanceof ObjectId)) {
      toMongoDottedObject(obj[key], target, path.concat(key));
    } else {
      target[path.concat(key).join('.')] = obj[key];
    }
  });

  if (objKeys.length === 0) {
    target[path.join('.')] = obj;
  }

  return target;
  /* eslint-enable */
}