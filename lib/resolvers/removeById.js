"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removeById;

var _findById = _interopRequireDefault(require("./findById"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function removeById(model, tc, opts // eslint-disable-line no-unused-vars
) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver removeById() should be instance of Mongoose Model.');
  }

  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver removeById() should be instance of TypeComposer.');
  }

  const findByIdResolver = (0, _findById.default)(model, tc);
  const outputTypeName = `RemoveById${tc.getTypeName()}Payload`;
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
    name: 'removeById',
    kind: 'mutation',
    description: 'Remove one document: ' + '1) Retrieve one document and remove with hooks via findByIdAndRemove. ' + '2) Return removed document.',
    type: outputType,
    args: {
      _id: 'MongoID!'
    },
    resolve: function () {
      var _resolve = _asyncToGenerator(function* (resolveParams) {
        const args = resolveParams.args || {};

        if (!args._id) {
          throw new Error(`${tc.getTypeName()}.removeById resolver requires args._id value`);
        } // We should get all data for document, cause Mongoose model may have hooks/middlewares
        // which required some fields which not in graphql projection
        // So empty projection returns all fields.


        resolveParams.projection = {};
        let doc = yield findByIdResolver.resolve(resolveParams);

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