"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addFilterOperators = addFilterOperators;
exports.processFilterOperators = processFilterOperators;
exports._prepareAndOrFilter = _prepareAndOrFilter;
exports._createOperatorsField = _createOperatorsField;
exports.OPERATORS_FIELDNAME = void 0;

var _graphql = require("graphql-compose/lib/graphql");

var _utils = require("../../utils");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const availableOperators = ['gt', 'gte', 'lt', 'lte', 'ne', 'in[]', 'nin[]'];
const OPERATORS_FIELDNAME = '_operators';
exports.OPERATORS_FIELDNAME = OPERATORS_FIELDNAME;

function addFilterOperators(itc, model, opts) {
  if (!{}.hasOwnProperty.call(opts, 'operators') || opts.operators !== false) {
    _createOperatorsField(itc, `Operators${opts.filterTypeName || ''}`, model, opts.operators || {});
  }

  itc.addFields({
    OR: [itc.getTypeNonNull()],
    AND: [itc.getTypeNonNull()]
  });
}

function processFilterOperators(filter, resolveParams) {
  _prepareAndOrFilter(filter, resolveParams);

  if (filter[OPERATORS_FIELDNAME]) {
    const operatorFields = filter[OPERATORS_FIELDNAME];
    Object.keys(operatorFields).forEach(fieldName => {
      const fieldOperators = _objectSpread({}, operatorFields[fieldName]);

      const criteria = {};
      Object.keys(fieldOperators).forEach(operatorName => {
        criteria[`$${operatorName}`] = fieldOperators[operatorName];
      });

      if (Object.keys(criteria).length > 0) {
        // eslint-disable-next-line
        resolveParams.query = resolveParams.query.where({
          [fieldName]: criteria
        });
      }
    });
  }
}

function _prepareAndOrFilter(filter, resolveParams) {
  /* eslint-disable no-param-reassign */
  if (!filter.OR && !filter.AND) return;
  const OR = filter.OR,
        AND = filter.AND;

  if (OR) {
    const $or = OR.map(d => {
      _prepareAndOrFilter(d);

      return (0, _utils.toMongoDottedObject)(d);
    });

    if (resolveParams) {
      resolveParams.query.where({
        $or
      });
    } else {
      filter.$or = $or;
      delete filter.OR;
    }
  }

  if (AND) {
    const $and = AND.map(d => {
      _prepareAndOrFilter(d);

      return (0, _utils.toMongoDottedObject)(d);
    });

    if (resolveParams) {
      resolveParams.query.where({
        $and
      });
    } else {
      filter.$and = $and;
      delete filter.AND;
    }
  }
  /* eslint-enable no-param-reassign */

}

function _createOperatorsField(itc, typeName, model, operatorsOpts) {
  const operatorsITC = itc.constructor.schemaComposer.getOrCreateITC(typeName, tc => {
    tc.setDescription('For performance reason this type contains only *indexed* fields.');
  }); // if `opts.resolvers.[resolverName].filter.operators` is empty and not disabled via `false`
  // then fill it up with indexed fields

  const indexedFields = (0, _utils.getIndexedFieldNamesForGraphQL)(model);

  if (operatorsOpts !== false && Object.keys(operatorsOpts).length === 0) {
    indexedFields.forEach(fieldName => {
      operatorsOpts[fieldName] = availableOperators; // eslint-disable-line
    });
  }

  itc.getFieldNames().forEach(fieldName => {
    if (operatorsOpts[fieldName] && operatorsOpts[fieldName] !== false) {
      const fields = {};
      let operators;

      if (operatorsOpts[fieldName] && Array.isArray(operatorsOpts[fieldName])) {
        operators = operatorsOpts[fieldName];
      } else {
        operators = availableOperators;
      }

      operators.forEach(operatorName => {
        const fc = itc.getFieldConfig(fieldName); // unwrap from GraphQLNonNull and GraphQLList, if present

        const namedType = (0, _graphql.getNamedType)(fc.type);

        if (namedType) {
          if (operatorName.slice(-2) === '[]') {
            // wrap with GraphQLList, if operator required this with `[]`
            const newName = operatorName.slice(0, -2);
            fields[newName] = _objectSpread({}, fc, {
              type: [namedType]
            });
          } else {
            fields[operatorName] = _objectSpread({}, fc, {
              type: namedType
            });
          }
        }
      });

      if (Object.keys(fields).length > 0) {
        const operatorTypeName = `${(0, _utils.upperFirst)(fieldName)}${typeName}`;
        const operatorITC = itc.constructor.schemaComposer.getOrCreateITC(operatorTypeName, tc => {
          tc.setFields(fields);
        });
        operatorsITC.setField(fieldName, operatorITC);
      }
    }
  }); // add to main filterITC if was added some fields

  if (operatorsITC.getFieldNames().length > 0) {
    itc.setField(OPERATORS_FIELDNAME, {
      type: operatorsITC,
      description: 'List of *indexed* fields that can be filtered via operators.'
    });
  }

  return operatorsITC;
}