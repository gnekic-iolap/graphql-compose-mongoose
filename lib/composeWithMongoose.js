"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeWithMongoose = composeWithMongoose;
exports.prepareFields = prepareFields;
exports.prepareInputFields = prepareInputFields;
exports.createInputType = createInputType;
exports.createResolvers = createResolvers;

var _graphqlCompose = require("graphql-compose");

var _fieldsConverter = require("./fieldsConverter");

var resolvers = _interopRequireWildcard(require("./resolvers"));

var _mongoid = _interopRequireDefault(require("./types/mongoid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/* eslint-disable no-use-before-define, no-param-reassign, global-require */
function composeWithMongoose(model, // MongooseModel, TODO use Model from mongoose_v4.x.x definition when it will be public
opts = {}) {
  const name = opts && opts.name || model.modelName;
  const sc = opts.schemaComposer || _graphqlCompose.schemaComposer;
  sc.set('MongoID', _mongoid.default);
  const tc = (0, _fieldsConverter.convertModelToGraphQL)(model, name, sc);

  if (opts.description) {
    tc.setDescription(opts.description);
  }

  if (opts.fields) {
    prepareFields(tc, opts.fields);
  }

  tc.setRecordIdFn(source => source ? `${source._id}` : '');
  createInputType(tc, opts.inputType);

  if (!{}.hasOwnProperty.call(opts, 'resolvers') || opts.resolvers !== false) {
    createResolvers(model, tc, opts.resolvers || {});
  }

  tc.makeFieldNonNull('_id');
  return tc;
}

function prepareFields(tc, opts) {
  if (Array.isArray(opts.only)) {
    const onlyFieldNames = opts.only;
    const removeFields = Object.keys(tc.getFields()).filter(fName => onlyFieldNames.indexOf(fName) === -1);
    tc.removeField(removeFields);
  }

  if (opts.remove) {
    tc.removeField(opts.remove);
  }
}

function prepareInputFields(inputTypeComposer, inputFieldsOpts) {
  if (Array.isArray(inputFieldsOpts.only)) {
    const onlyFieldNames = inputFieldsOpts.only;
    const removeFields = Object.keys(inputTypeComposer.getFields()).filter(fName => onlyFieldNames.indexOf(fName) === -1);
    inputTypeComposer.removeField(removeFields);
  }

  if (inputFieldsOpts.remove) {
    inputTypeComposer.removeField(inputFieldsOpts.remove);
  }

  if (inputFieldsOpts.required) {
    inputTypeComposer.makeRequired(inputFieldsOpts.required);
  }
}

function createInputType(tc, inputTypeOpts = {}) {
  const inputTypeComposer = tc.getInputTypeComposer();

  if (inputTypeOpts.name) {
    inputTypeComposer.setTypeName(inputTypeOpts.name);
  }

  if (inputTypeOpts.description) {
    inputTypeComposer.setDescription(inputTypeOpts.description);
  }

  if (inputTypeOpts.fields) {
    prepareInputFields(inputTypeComposer, inputTypeOpts.fields);
  }
}

function createResolvers(model, tc, opts) {
  const names = resolvers.getAvailableNames();
  names.forEach(resolverName => {
    if (!{}.hasOwnProperty.call(opts, resolverName) || opts[resolverName] !== false) {
      const createResolverFn = resolvers[resolverName];

      if (createResolverFn) {
        const resolver = createResolverFn(model, tc, opts[resolverName] || {});

        if (resolver) {
          tc.setResolver(resolverName, resolver);
        }
      }
    }
  });
}