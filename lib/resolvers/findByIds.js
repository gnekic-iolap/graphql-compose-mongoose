"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findByIds;

var _helpers = require("./helpers");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function findByIds(model, tc, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver findByIds() should be instance of Mongoose Model.');
  }

  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver findByIds() should be instance of TypeComposer.');
  }

  return new tc.constructor.schemaComposer.Resolver({
    type: [tc],
    name: 'findByIds',
    kind: 'query',
    args: _objectSpread({
      _ids: '[MongoID]!'
    }, (0, _helpers.limitHelperArgs)(_objectSpread({}, opts && opts.limit)), (0, _helpers.sortHelperArgs)(tc, model, _objectSpread({
      sortTypeName: `SortFindByIds${tc.getTypeName()}Input`
    }, opts && opts.sort))),
    resolve: resolveParams => {
      const args = resolveParams.args || {};

      if (!Array.isArray(args._ids) || args._ids.length === 0) {
        return Promise.resolve([]);
      }

      const selector = {
        _id: {
          $in: args._ids
        }
      };
      resolveParams.query = model.find(selector); // eslint-disable-line

      (0, _helpers.projectionHelper)(resolveParams);
      (0, _helpers.limitHelper)(resolveParams);
      (0, _helpers.sortHelper)(resolveParams);
      return resolveParams.query.exec();
    }
  });
}