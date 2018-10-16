"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeMany;

var _helpers = require("./helpers");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function removeMany(model, tc, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver removeMany() should be instance of Mongoose Model.');
  }

  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver removeMany() should be instance of TypeComposer.');
  }

  const outputTypeName = `RemoveMany${tc.getTypeName()}Payload`;
  const outputType = tc.constructor.schemaComposer.getOrCreateTC(outputTypeName, t => {
    t.addFields({
      numAffected: {
        type: 'Int',
        description: 'Affected documents number'
      }
    });
  });
  const resolver = new tc.constructor.schemaComposer.Resolver({
    name: 'removeMany',
    kind: 'mutation',
    description: 'Remove many documents without returning them: ' + 'Use Query.remove mongoose method. ' + 'Do not apply mongoose defaults, setters, hooks and validation. ',
    type: outputType,
    args: _objectSpread({}, (0, _helpers.filterHelperArgs)(tc, model, _objectSpread({
      filterTypeName: `FilterRemoveMany${tc.getTypeName()}Input`,
      isRequired: true,
      model
    }, opts && opts.filter))),
    resolve: function () {
      var _resolve = _asyncToGenerator(function* (resolveParams) {
        const filterData = resolveParams.args && resolveParams.args.filter || {};

        if (!(typeof filterData === 'object') || Object.keys(filterData).length === 0) {
          throw new Error(`${tc.getTypeName()}.removeMany resolver requires at least one value in args.filter`);
        }

        resolveParams.query = model.find();
        (0, _helpers.filterHelper)(resolveParams);
        resolveParams.query = resolveParams.query.remove();
        let res; // `beforeQuery` is experemental feature, if you want to use it
        // please open an issue with your use case, cause I suppose that
        // this option is excessive

        if (resolveParams.beforeQuery) {
          res = yield resolveParams.beforeQuery(resolveParams.query, resolveParams);
        } else {
          res = yield resolveParams.query.exec();
        }

        if (res.ok) {
          // mongoose 5
          return {
            numAffected: res.n
          };
        } else if (res.result && res.result.ok) {
          // mongoose 4
          return {
            numAffected: res.result.n
          };
        } // unexpected response


        throw new Error(JSON.stringify(res));
      });

      return function resolve(_x) {
        return _resolve.apply(this, arguments);
      };
    }()
  });
  return resolver;
}