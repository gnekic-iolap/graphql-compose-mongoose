"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeOne;

var _helpers = require("./helpers");

var _findOne = _interopRequireDefault(require("./findOne"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function removeOne(model, tc, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver removeOne() should be instance of Mongoose Model.');
  }

  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver removeOne() should be instance of TypeComposer.');
  }

  const findOneResolver = (0, _findOne.default)(model, tc, opts);
  const outputTypeName = `RemoveOne${tc.getTypeName()}Payload`;
  const outputType = tc.constructor.schemaComposer.getOrCreateTC(outputTypeName, t => {
    t.addFields({
      recordId: {
        type: 'MongoID',
        description: 'Removed document ID'
      },
      record: {
        type: tc,
        description: 'Removed document'
      }
    });
  });
  const resolver = new tc.constructor.schemaComposer.Resolver({
    name: 'removeOne',
    kind: 'mutation',
    description: 'Remove one document: ' + '1) Remove with hooks via findOneAndRemove. ' + '2) Return removed document.',
    type: outputType,
    args: _objectSpread({}, (0, _helpers.filterHelperArgs)(tc, model, _objectSpread({
      filterTypeName: `FilterRemoveOne${tc.getTypeName()}Input`,
      model
    }, opts && opts.filter)), (0, _helpers.sortHelperArgs)(tc, model, _objectSpread({
      sortTypeName: `SortRemoveOne${tc.getTypeName()}Input`
    }, opts && opts.sort))),
    resolve: function () {
      var _resolve = _asyncToGenerator(function* (resolveParams) {
        const filterData = resolveParams.args && resolveParams.args.filter || {};

        if (!(typeof filterData === 'object') || Object.keys(filterData).length === 0) {
          return Promise.reject(new Error(`${tc.getTypeName()}.removeOne resolver requires at least one value in args.filter`));
        } // We should get all data for document, cause Mongoose model may have hooks/middlewares
        // which required some fields which not in graphql projection
        // So empty projection returns all fields.


        resolveParams.projection = {};
        let doc = yield findOneResolver.resolve(resolveParams);

        if (resolveParams.beforeRecordMutate) {
          doc = yield resolveParams.beforeRecordMutate(doc, resolveParams);
        }

        if (doc) {
          yield doc.remove();
          return {
            record: doc,
            recordId: tc.getRecordIdFn()(doc)
          };
        }

        return null;
      });

      return function resolve(_x) {
        return _resolve.apply(this, arguments);
      };
    }()
  });
  return resolver;
}