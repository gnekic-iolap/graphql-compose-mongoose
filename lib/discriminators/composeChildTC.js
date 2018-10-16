"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeChildTC = composeChildTC;

var _graphqlCompose = require("graphql-compose");

var _prepareChildResolvers = require("./prepareChildResolvers");

var _reorderFields = require("./utils/reorderFields");

// copy all baseTypeComposer fields to childTC
// these are the fields before calling discriminator
function copyBaseTCFieldsToChildTC(baseDTC, childTC) {
  const baseFields = baseDTC.getFieldNames();
  const childFields = childTC.getFieldNames();
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = baseFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      const field = _step.value;
      const childFieldName = childFields.find(fld => fld === field);

      if (childFieldName) {
        childTC.extendField(field, {
          type: baseDTC.getFieldType(field)
        });
      } else {
        childTC.setField(field, baseDTC.getField(field));
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

  return childTC;
}

function composeChildTC(baseDTC, childTC, opts) {
  const composedChildTC = copyBaseTCFieldsToChildTC(baseDTC, childTC);
  composedChildTC.setInterfaces([baseDTC.getDInterface()]);
  (0, _prepareChildResolvers.prepareChildResolvers)(baseDTC, composedChildTC, opts);
  (0, _reorderFields.reorderFields)(composedChildTC, opts.reorderFields, baseDTC.getDKey(), baseDTC.getFieldNames());
  return composedChildTC;
}