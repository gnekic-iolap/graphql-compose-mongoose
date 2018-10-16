"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findMany;

var _helpers = require("./helpers");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function findMany(model, tc, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver findMany() should be instance of Mongoose Model.');
  }

  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver findMany() should be instance of TypeComposer.');
  }

  return new tc.constructor.schemaComposer.Resolver({
    type: [tc],
    name: 'findMany',
    kind: 'query',
    args: _objectSpread({}, (0, _helpers.filterHelperArgs)(tc, model, _objectSpread({
      filterTypeName: `FilterFindMany${tc.getTypeName()}Input`,
      model
    }, opts && opts.filter)), (0, _helpers.skipHelperArgs)(), (0, _helpers.limitHelperArgs)(_objectSpread({}, opts && opts.limit)), (0, _helpers.sortHelperArgs)(tc, model, _objectSpread({
      sortTypeName: `SortFindMany${tc.getTypeName()}Input`
    }, opts && opts.sort))),
    resolve: resolveParams => {
      resolveParams.query = model.find().batchSize(1000000);
      (0, _helpers.filterHelper)(resolveParams);
      (0, _helpers.skipHelper)(resolveParams);
      (0, _helpers.limitHelper)(resolveParams);
      (0, _helpers.sortHelper)(resolveParams);
      (0, _helpers.projectionHelper)(resolveParams);
      return resolveParams.query.exec();
    }
  });
}