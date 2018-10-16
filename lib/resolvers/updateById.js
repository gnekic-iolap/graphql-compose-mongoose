"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = updateById;

var _record = require("./helpers/record");

var _findById = _interopRequireDefault(require("./findById"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function updateById(model, tc, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver updateById() should be instance of Mongoose Model.');
  }

  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver updateById() should be instance of TypeComposer.');
  }

  const findByIdResolver = (0, _findById.default)(model, tc);
  const outputTypeName = `UpdateById${tc.getTypeName()}Payload`;
  const outputType = tc.constructor.schemaComposer.getOrCreateTC(outputTypeName, t => {
    t.addFields({
      recordId: {
        type: 'MongoID',
        description: 'Updated document ID'
      },
      record: {
        type: tc.getType(),
        description: 'Updated document'
      }
    });
  });
  const resolver = new tc.constructor.schemaComposer.Resolver({
    name: 'updateById',
    kind: 'mutation',
    description: 'Update one document: ' + '1) Retrieve one document by findById. ' + '2) Apply updates to mongoose document. ' + '3) Mongoose applies defaults, setters, hooks and validation. ' + '4) And save it.',
    type: outputType,
    args: _objectSpread({}, (0, _record.recordHelperArgs)(tc, _objectSpread({
      recordTypeName: `UpdateById${tc.getTypeName()}Input`,
      requiredFields: ['_id'],
      isRequired: true
    }, opts && opts.record))),
    resolve: function () {
      var _resolve = _asyncToGenerator(function* (resolveParams) {
        const recordData = resolveParams.args && resolveParams.args.record || {};

        if (!(typeof recordData === 'object')) {
          return Promise.reject(new Error(`${tc.getTypeName()}.updateById resolver requires args.record value`));
        }

        if (!recordData._id) {
          return Promise.reject(new Error(`${tc.getTypeName()}.updateById resolver requires args.record._id value`));
        }

        resolveParams.args._id = recordData._id;
        delete recordData._id; // We should get all data for document, cause Mongoose model may have hooks/middlewares
        // which required some fields which not in graphql projection
        // So empty projection returns all fields.

        resolveParams.projection = {};
        let doc = yield findByIdResolver.resolve(resolveParams);

        if (resolveParams.beforeRecordMutate) {
          doc = yield resolveParams.beforeRecordMutate(doc, resolveParams);
        }

        if (!doc) {
          throw new Error('Document not found');
        }

        if (recordData) {
          doc.set(recordData);
          yield doc.save();
        }

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