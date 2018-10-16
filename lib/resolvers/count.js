"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = count;

var _helpers = require("./helpers");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function count(model, tc, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver count() should be instance of Mongoose Model.');
  }

  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver count() should be instance of TypeComposer.');
  }

  return new tc.constructor.schemaComposer.Resolver({
    type: 'Int',
    name: 'count',
    kind: 'query',
    args: _objectSpread({}, (0, _helpers.filterHelperArgs)(tc, model, _objectSpread({
      filterTypeName: `Filter${tc.getTypeName()}Input`,
      model
    }, opts && opts.filter))),
    resolve: resolveParams => {
      resolveParams.query = model.find();
      (0, _helpers.filterHelper)(resolveParams);

      if (resolveParams.query.countDocuments) {
        // mongoose 5.2.0 and above
        return resolveParams.query.countDocuments().exec();
      } else {
        // mongoose 5 and below
        return resolveParams.query.count().exec();
      }
    }
  });
}