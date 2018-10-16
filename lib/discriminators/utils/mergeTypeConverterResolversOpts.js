"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergePrimitiveTypeFields = mergePrimitiveTypeFields;
exports.mergeFilterOperatorsOptsMap = mergeFilterOperatorsOptsMap;
exports.mergeArraysTypeFields = mergeArraysTypeFields;
exports.mergeMapTypeFields = mergeMapTypeFields;
exports.mergeTypeConverterResolverOpts = mergeTypeConverterResolverOpts;

var _helpers = require("../../resolvers/helpers");

var _mergeCustomizationOptions = require("./mergeCustomizationOptions");

function mergePrimitiveTypeFields(baseField, childField, argOptsTypes) {
  if (Array.isArray(argOptsTypes)) {
    if (argOptsTypes.find(v => v === 'boolean' || v === 'number')) {
      return mergePrimitiveTypeFields(baseField, childField, 'boolean');
    }
  }

  if (argOptsTypes === 'boolean' || argOptsTypes === 'number') {
    if (childField === undefined) {
      return baseField;
    } else {
      return childField;
    }
  }

  return childField;
}

function mergeFilterOperatorsOptsMap(baseFilterOperatorField, childFilterOperatorField) {
  const baseOptsKeys = Object.keys(baseFilterOperatorField);
  const baseOptsTypes = {};

  for (var _i = 0; _i < baseOptsKeys.length; _i++) {
    const key = baseOptsKeys[_i];
    baseOptsTypes[key] = 'string[]';
  }
  /* eslint-disable */


  childFilterOperatorField = mergeMapTypeFields(baseFilterOperatorField, childFilterOperatorField, baseOptsTypes);
  /* eslint-enable */

  return childFilterOperatorField;
}

function mergeArraysTypeFields(baseField, childField, argOptsType) {
  let merged = childField !== undefined ? childField : {};

  if (Array.isArray(argOptsType)) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = argOptsType[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        const argType = _step.value;

        if (argType === 'FilterOperatorsOptsMap') {
          merged = mergeFilterOperatorsOptsMap(baseField, merged);
          continue; // eslint-disable-line no-continue
        }

        merged = mergePrimitiveTypeFields(baseField, childField, argType);
        merged = (0, _mergeCustomizationOptions.mergeStringAndStringArraysFields)(baseField, merged, argType);
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
  }

  return merged;
}

function mergeMapTypeFields(baseField, childField, argOptsTypes) {
  const merged = childField === undefined ? {} : childField;

  if (argOptsTypes !== null && typeof argOptsTypes === 'object') {
    for (const argOptType in argOptsTypes) {
      if (argOptsTypes.hasOwnProperty(argOptType)) {
        if (baseField[argOptType] === undefined) {
          continue; // eslint-disable-line no-continue
        }

        if (childField === undefined) {
          childField = {}; // eslint-disable-line no-param-reassign
        }

        if (argOptType === 'FilterOperatorsOptsMap') {
          merged[argOptType] = mergeFilterOperatorsOptsMap(baseField[argOptType], merged[argOptType]);
          continue; // eslint-disable-line no-continue
        }

        merged[argOptType] = mergePrimitiveTypeFields(baseField[argOptType], childField[argOptType], argOptsTypes[argOptType]);
        merged[argOptType] = (0, _mergeCustomizationOptions.mergeStringAndStringArraysFields)(baseField[argOptType], merged[argOptType], argOptsTypes[argOptType]);
        merged[argOptType] = mergeArraysTypeFields(baseField[argOptType], merged[argOptType], argOptsTypes[argOptType]);
      }
    }
  }

  return merged;
}

function mergeTypeConverterResolverOpts(baseTypeConverterResolverOpts, childTypeConverterResolverOpts) {
  if (!baseTypeConverterResolverOpts) {
    return childTypeConverterResolverOpts;
  }

  if (!childTypeConverterResolverOpts) {
    return baseTypeConverterResolverOpts;
  }

  const mergedTypeConverterResolverOpts = JSON.parse(JSON.stringify(childTypeConverterResolverOpts)) || {};

  for (const baseResolverOpt in baseTypeConverterResolverOpts) {
    if (baseTypeConverterResolverOpts.hasOwnProperty(baseResolverOpt)) {
      // e.g. baseResolverArgs = [ limit, filter ]
      const baseResolverArgs = baseTypeConverterResolverOpts[baseResolverOpt];
      let childResolverArgs = childTypeConverterResolverOpts[baseResolverOpt]; // e.g. { findMany: ... findById: ... }  baseResolverOpt = findById

      if (baseResolverArgs === undefined) {
        continue; // eslint-disable-line no-continue
      } // if nothing set for child resolver set base


      if (baseResolverArgs === false && childResolverArgs === undefined) {
        mergedTypeConverterResolverOpts[baseResolverOpt] = false;
        continue; // eslint-disable-line no-continue
      } // set to empty object in-order to reference


      if (childResolverArgs === undefined) {
        childResolverArgs = {};
      } // create path on merged if not available


      const mergedResolverArgs = mergedTypeConverterResolverOpts[baseResolverOpt] || {}; // e.g. { limit: ..., filter: ... }

      for (const baseResolverArg in baseResolverArgs) {
        if (baseResolverArgs.hasOwnProperty(baseResolverArg)) {
          const argOptsType = _helpers.MergeAbleHelperArgsOpts[baseResolverArg]; // e.g. {limit: ...}  baseResolverArg = limit

          if (baseResolverArgs[baseResolverArg] === undefined) {
            continue; // eslint-disable-line no-continue
          }

          mergedResolverArgs[baseResolverArg] = mergePrimitiveTypeFields(baseResolverArgs[baseResolverArg], childResolverArgs[baseResolverArg], argOptsType);
          mergedResolverArgs[baseResolverArg] = mergeMapTypeFields(baseResolverArgs[baseResolverArg], mergedResolverArgs[baseResolverArg], argOptsType);
          mergedResolverArgs[baseResolverArg] = mergeArraysTypeFields(baseResolverArgs[baseResolverArg], mergedResolverArgs[baseResolverArg], argOptsType);
        }
      }

      mergedTypeConverterResolverOpts[baseResolverOpt] = mergedResolverArgs;
    }
  }

  return mergedTypeConverterResolverOpts;
}