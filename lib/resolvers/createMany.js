"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMany;

var _graphqlCompose = require("graphql-compose");

var _helpers = require("./helpers");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function createSingle(_x, _x2, _x3, _x4) {
  return _createSingle.apply(this, arguments);
}

function _createSingle() {
  _createSingle = _asyncToGenerator(function* (model, tc, recordData, resolveParams) {
    // eslint-disable-next-line new-cap
    let doc = new model(recordData);

    if (resolveParams.beforeRecordMutate) {
      doc = yield resolveParams.beforeRecordMutate(doc, resolveParams);
      if (!doc) return null;
    }

    return doc.save();
  });
  return _createSingle.apply(this, arguments);
}

function createMany(model, tc, opts) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver createMany() should be instance of Mongoose Model.');
  }

  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver createMany() should be instance of TypeComposer.');
  }

  const outputTypeName = `CreateMany${tc.getTypeName()}Payload`;
  const outputType = tc.constructor.schemaComposer.getOrCreateTC(outputTypeName, t => {
    t.addFields({
      recordIds: {
        type: '[MongoID]!',
        description: 'Created document ID'
      },
      records: {
        type: new _graphqlCompose.graphql.GraphQLNonNull(tc.getTypePlural()),
        description: 'Created documents'
      },
      createCount: {
        type: 'Int!',
        description: 'Count of all documents created'
      }
    });
  });
  const resolver = new tc.constructor.schemaComposer.Resolver({
    name: 'createMany',
    kind: 'mutation',
    description: 'Creates Many documents with mongoose defaults, setters, hooks and validation',
    type: outputType,
    args: {
      records: {
        type: new _graphqlCompose.graphql.GraphQLNonNull(new _graphqlCompose.graphql.GraphQLList((0, _helpers.recordHelperArgs)(tc, _objectSpread({
          recordTypeName: `CreateMany${tc.getTypeName()}Input`,
          removeFields: ['id', '_id'],
          isRequired: true
        }, opts && opts.records)).record.type))
      }
    },
    resolve: function () {
      var _resolve = _asyncToGenerator(function* (resolveParams) {
        const recordData = resolveParams.args && resolveParams.args.records || [];

        if (!Array.isArray(recordData) || recordData.length === 0) {
          throw new Error(`${tc.getTypeName()}.createMany resolver requires args.records to be an Array and must contain at least one record`);
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = recordData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            const record = _step.value;

            if (!(typeof record === 'object') || Object.keys(record).length === 0) {
              throw new Error(`${tc.getTypeName()}.createMany resolver requires args.records to contain non-empty records, with at least one value`);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        const recordPromises = []; // concurrently create docs

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = recordData[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            const record = _step2.value;
            recordPromises.push(createSingle(model, tc, record, resolveParams));
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        const results = yield Promise.all(recordPromises);
        const returnObj = {
          records: [],
          recordIds: [],
          createCount: 0
        };
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = results[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            const doc = _step3.value;

            if (doc) {
              returnObj.createCount += 1;
              returnObj.records.push(doc);
              returnObj.recordIds.push(doc._id);
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return returnObj;
      });

      return function resolve(_x5) {
        return _resolve.apply(this, arguments);
      };
    }()
  });
  return resolver;
}