"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dotPathsToEmbedded = dotPathsToEmbedded;
exports.getFieldsFromModel = getFieldsFromModel;
exports.convertModelToGraphQL = convertModelToGraphQL;
exports.convertSchemaToGraphQL = convertSchemaToGraphQL;
exports.convertFieldToGraphQL = convertFieldToGraphQL;
exports.deriveComplexType = deriveComplexType;
exports.scalarToGraphQL = scalarToGraphQL;
exports.arrayToGraphQL = arrayToGraphQL;
exports.embeddedToGraphQL = embeddedToGraphQL;
exports.enumToGraphQL = enumToGraphQL;
exports.documentArrayToGraphQL = documentArrayToGraphQL;
exports.referenceToGraphQL = referenceToGraphQL;
exports.ComplexTypes = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _objectPath = _interopRequireDefault(require("object-path"));

var _graphqlCompose = require("graphql-compose");

var _mongoid = _interopRequireDefault(require("./types/mongoid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const ComplexTypes = {
  ARRAY: 'ARRAY',
  EMBEDDED: 'EMBEDDED',
  DOCUMENT_ARRAY: 'DOCUMENT_ARRAY',
  ENUM: 'ENUM',
  REFERENCE: 'REFERENCE',
  SCALAR: 'SCALAR',
  MIXED: 'MIXED'
};
exports.ComplexTypes = ComplexTypes;

function _getFieldName(field) {
  return field.path || '__unknownField__';
}

function _getFieldType(field) {
  return field.instance;
}

function _getFieldDescription(field) {
  if (field.options && field.options.description) {
    return field.options.description;
  }

  return undefined;
}

function _getFieldEnums(field) {
  if (field.enumValues && field.enumValues.length > 0) {
    return field.enumValues;
  }

  return undefined;
}

function dotPathsToEmbedded(fields) {
  // convert only one dot-level on this step to EmbeddedModel
  // further when converting EmbeddedModel to GQL, it internally
  const result = {};
  Object.keys(fields).forEach(fieldName => {
    const dotIdx = fieldName.indexOf('.');

    if (dotIdx === -1) {
      result[fieldName] = fields[fieldName];
    } else {
      // create pseudo sub-model
      const name = fieldName.substr(0, dotIdx);

      if (!result[name]) {
        const embeddedField = {
          instance: 'Embedded',
          path: name,
          schema: {
            paths: {}
          }
        };
        result[name] = embeddedField;
      }

      const subName = fieldName.substr(dotIdx + 1);
      const fieldSchema = result[name].schema;

      if (!fieldSchema) {
        throw new Error(`Field ${name} does not have schema property`);
      }

      fieldSchema.paths[subName] = _objectSpread({}, fields[fieldName], {
        path: subName
      });
    }
  });
  return result;
}

function getFieldsFromModel(model) {
  if (!model || !model.schema || !model.schema.paths) {
    throw new Error('You provide incorrect mongoose model to `getFieldsFromModel()`. ' + 'Correct model should contain `schema.paths` properties.');
  }

  const fields = {};
  const paths = dotPathsToEmbedded(model.schema.paths);
  Object.keys(paths).filter(path => !path.startsWith('__')) // skip hidden fields
  .forEach(path => {
    fields[path] = paths[path];
  });
  return fields;
}

function convertModelToGraphQL(model, typeName, sc) {
  const schemaComposer = sc || _graphqlCompose.schemaComposer;

  if (!typeName) {
    throw new Error('You provide empty name for type. `name` argument should be non-empty string.');
  } // if model already has generated TypeComposer early, then return it
  // $FlowFixMe await landing graphql-compose@4.4.2 or above


  if (schemaComposer.has(model.schema)) {
    // $FlowFixMe await landing graphql-compose@4.4.2 or above
    return schemaComposer.getTC(model.schema);
  }

  const typeComposer = schemaComposer.getOrCreateTC(typeName); // $FlowFixMe await landing graphql-compose@4.4.2 or above

  schemaComposer.set(model.schema, typeComposer);
  schemaComposer.set(typeName, typeComposer);
  const mongooseFields = getFieldsFromModel(model);
  const graphqlFields = {};
  Object.keys(mongooseFields).forEach(fieldName => {
    const mongooseField = mongooseFields[fieldName];
    graphqlFields[fieldName] = {
      type: convertFieldToGraphQL(mongooseField, typeName, schemaComposer),
      description: _getFieldDescription(mongooseField)
    };

    if (deriveComplexType(mongooseField) === ComplexTypes.EMBEDDED) {
      // https://github.com/nodkz/graphql-compose-mongoose/issues/7
      graphqlFields[fieldName].resolve = source => {
        if (source) {
          if (source.toObject) {
            const obj = source.toObject();
            return obj[fieldName];
          }

          return source[fieldName];
        }

        return null;
      };
    }
  });
  typeComposer.addFields(graphqlFields);
  return typeComposer;
}

function convertSchemaToGraphQL(schema, typeName, sc) {
  const schemaComposer = sc || _graphqlCompose.schemaComposer;

  if (!typeName) {
    throw new Error('You provide empty name for type. `name` argument should be non-empty string.');
  } // $FlowFixMe await landing graphql-compose@4.4.2 or above


  if (schemaComposer.has(schema)) {
    // $FlowFixMe await landing graphql-compose@4.4.2 or above
    return schemaComposer.getTC(schema);
  }

  const tc = convertModelToGraphQL({
    schema
  }, typeName, schemaComposer); // also generate InputType

  tc.getInputTypeComposer(); // $FlowFixMe await landing graphql-compose@4.4.2 or above

  schemaComposer.set(schema, tc);
  return tc;
}

function convertFieldToGraphQL(field, prefix = '', schemaComposer) {
  if (!schemaComposer.has('MongoID')) {
    schemaComposer.set('MongoID', _mongoid.default);
  }

  const complexType = deriveComplexType(field);

  switch (complexType) {
    case ComplexTypes.SCALAR:
      return scalarToGraphQL(field);

    case ComplexTypes.ARRAY:
      return arrayToGraphQL(field, prefix, schemaComposer);

    case ComplexTypes.EMBEDDED:
      return embeddedToGraphQL(field, prefix, schemaComposer);

    case ComplexTypes.ENUM:
      return enumToGraphQL(field, prefix, schemaComposer);

    case ComplexTypes.REFERENCE:
      return referenceToGraphQL(field);

    case ComplexTypes.DOCUMENT_ARRAY:
      return documentArrayToGraphQL(field, prefix, schemaComposer);

    case ComplexTypes.MIXED:
      return 'JSON';

    default:
      return scalarToGraphQL(field);
  }
}

function deriveComplexType(field) {
  if (!field || !field.path || !field.instance) {
    throw new Error('You provide incorrect mongoose field to `deriveComplexType()`. ' + 'Correct field should contain `path` and `instance` properties.');
  }

  const fieldType = _getFieldType(field);

  if (field instanceof _mongoose.default.Schema.Types.DocumentArray || fieldType === 'Array' && _objectPath.default.has(field, 'schema.paths')) {
    return ComplexTypes.DOCUMENT_ARRAY;
  } else if (field instanceof _mongoose.default.Schema.Types.Embedded || fieldType === 'Embedded') {
    return ComplexTypes.EMBEDDED;
  } else if (field instanceof _mongoose.default.Schema.Types.Array || _objectPath.default.has(field, 'caster.instance')) {
    return ComplexTypes.ARRAY;
  } else if (field instanceof _mongoose.default.Schema.Types.Mixed) {
    return ComplexTypes.MIXED;
  } else if (fieldType === 'ObjectID') {
    return ComplexTypes.REFERENCE;
  }

  const enums = _getFieldEnums(field);

  if (enums) {
    return ComplexTypes.ENUM;
  }

  return ComplexTypes.SCALAR;
}

function scalarToGraphQL(field) {
  const typeName = _getFieldType(field);

  switch (typeName) {
    case 'String':
      return 'String';

    case 'Number':
      return 'Float';

    case 'Date':
      return 'Date';

    case 'Buffer':
      return 'Buffer';

    case 'Boolean':
      return 'Boolean';

    case 'ObjectID':
      return 'MongoID';

    default:
      return 'JSON';
  }
}

function arrayToGraphQL(field, prefix = '', schemaComposer) {
  if (!field || !field.caster) {
    throw new Error('You provide incorrect mongoose field to `arrayToGraphQL()`. ' + 'Correct field should contain `caster` property.');
  }

  const unwrappedField = _objectSpread({}, field.caster);

  const outputType = convertFieldToGraphQL(unwrappedField, prefix, schemaComposer);
  return [outputType];
}

function embeddedToGraphQL(field, prefix = '', schemaComposer) {
  const fieldName = _getFieldName(field);

  const fieldType = _getFieldType(field);

  if (fieldType !== 'Embedded') {
    throw new Error(`You provide incorrect field '${prefix}.${fieldName}' to 'embeddedToGraphQL()'. ` + 'This field should has `Embedded` type. ');
  }

  const fieldSchema = field.schema;

  if (!fieldSchema) {
    throw new Error(`Mongoose field '${prefix}.${fieldName}' should have 'schema' property`);
  }

  const typeName = `${prefix}${(0, _graphqlCompose.upperFirst)(fieldName)}`;
  return convertSchemaToGraphQL(fieldSchema, typeName, schemaComposer);
}

function enumToGraphQL(field, prefix = '', schemaComposer) {
  const valueList = _getFieldEnums(field);

  if (!valueList) {
    throw new Error('You provide incorrect mongoose field to `enumToGraphQL()`. ' + 'Correct field should contain `enumValues` property');
  }

  const typeName = `Enum${prefix}${(0, _graphqlCompose.upperFirst)(_getFieldName(field))}`;
  return schemaComposer.getOrCreateETC(typeName, etc => {
    const desc = _getFieldDescription(field);

    if (desc) etc.setDescription(desc);
    const fields = valueList.reduce((result, val) => {
      result[val] = {
        value: val
      }; // eslint-disable-line no-param-reassign

      return result;
    }, {});
    etc.setFields(fields);
  });
}

function documentArrayToGraphQL(field, prefix = '', schemaComposer) {
  if (!(field instanceof _mongoose.default.Schema.Types.DocumentArray) && !_objectPath.default.has(field, 'schema.paths')) {
    throw new Error('You provide incorrect mongoose field to `documentArrayToGraphQL()`. ' + 'Correct field should be instance of `mongoose.Schema.Types.DocumentArray`');
  }

  const typeName = `${prefix}${(0, _graphqlCompose.upperFirst)(_getFieldName(field))}`;
  const tc = convertModelToGraphQL(field, typeName, schemaComposer);
  return [tc];
}

function referenceToGraphQL(field) {
  return scalarToGraphQL(field);
}