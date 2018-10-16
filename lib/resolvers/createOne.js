"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createOne;

var _helpers = require("./helpers");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createOne(model, tc, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver createOne() should be instance of Mongoose Model.');
  }

  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver createOne() should be instance of TypeComposer.');
  }

  const outputTypeName = `CreateOne${tc.getTypeName()}Payload`;
  const outputType = tc.constructor.schemaComposer.getOrCreateTC(outputTypeName, t => {
    t.addFields({
      recordId: {
        type: 'MongoID',
        description: 'Created document ID'
      },
      record: {
        type: tc,
        description: 'Created document'
      }
    });
  });
  const resolver = new tc.constructor.schemaComposer.Resolver({
    name: 'createOne',
    kind: 'mutation',
    description: 'Create one document with mongoose defaults, setters, hooks and validation',
    type: outputType,
    args: _objectSpread({}, (0, _helpers.recordHelperArgs)(tc, _objectSpread({
      recordTypeName: `CreateOne${tc.getTypeName()}Input`,
      removeFields: ['id', '_id'],
      isRequired: true
    }, opts && opts.record))),
    resolve: function () {
      var _resolve = _asyncToGenerator(function* (resolveParams) {
        const recordData = resolveParams.args && resolveParams.args.record || {};

        if (!(typeof recordData === 'object') || Object.keys(recordData).length === 0) {
          throw new Error(`${tc.getTypeName()}.createOne resolver requires at least one value in args.record`);
        }

        let doc = new model(recordData);

        if (resolveParams.beforeRecordMutate) {
          doc = yield resolveParams.beforeRecordMutate(doc, resolveParams);
          if (!doc) return null;
        }

        yield doc.save();
        return {
          record: doc,
          recordId: tc.getRecordIdFn()(doc)
        };
      });

      return function resolve(_x) {
        return _resolve.apply(this, arguments);
      };
    }()
  });
  return resolver;
}