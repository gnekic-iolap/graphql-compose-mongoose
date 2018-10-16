"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareChildResolvers = prepareChildResolvers;

var _graphqlCompose = require("graphql-compose");

var _DiscriminatorTypeComposer = require("./DiscriminatorTypeComposer");

var _resolvers = require("../resolvers");

// set the DKey as a query on filter, also project it
// Also look at it like setting for filters, makes sure to limit
// query to child type
function setQueryDKey(resolver, childTC, DKey, fromField) {
  if (resolver) {
    resolver.wrapResolve(next => resolve => {
      const DName = childTC.getTypeName();
      /* eslint no-param-reassign: 0 */

      resolve.args = resolve.args ? resolve.args : {};
      resolve.projection = resolve.projection ? resolve.projection : {};

      if (fromField === 'records') {
        resolve.args[fromField] = resolve.args[fromField] || [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = resolve.args[fromField][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            const record = _step.value;
            record[DKey] = DName;
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
      } else if (fromField) {
        resolve.args[fromField] = resolve.args[fromField] ? resolve.args[fromField] : {};
        resolve.args[fromField][DKey] = DName;
      } else {
        resolve.args[DKey] = DName;
      }

      resolve.projection[DKey] = 1;
      /* eslint no-param-reassign: 1 */

      return next(resolve);
    });
  }
} // hide the DKey on the filter or record


function hideDKey(resolver, childTC, DKey, fromField) {
  if (Array.isArray(fromField)) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = fromField[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        const field = _step2.value;
        hideDKey(resolver, childTC, DKey, field);
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
  } else if (fromField && resolver.hasArg(fromField)) {
    const fieldTC = resolver.getArgTC(fromField);

    if (fieldTC) {
      fieldTC.removeField(DKey);
    }
  } else {
    resolver.removeArg(DKey);
  }
} // Set baseDTC resolver argTypes on childTC fields shared with DInterface


function copyResolverArgTypes(resolver, baseDTC, fromArg) {
  if (resolver && baseDTC.hasInputTypeComposer()) {
    if (Array.isArray(fromArg)) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = fromArg[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          const field = _step3.value;
          copyResolverArgTypes(resolver, baseDTC, field);
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
    } else if (fromArg && resolver.hasArg(fromArg)) {
      if (baseDTC.hasResolver(resolver.name) && baseDTC.getResolver(resolver.name).hasArg(fromArg)) {
        const childResolverArgTc = resolver.getArgTC(fromArg);
        const baseResolverArgTC = baseDTC.getResolver(resolver.name).getArgTC(fromArg);
        const baseResolverArgTCFields = baseResolverArgTC.getFieldNames();
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = baseResolverArgTCFields[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            const baseArgField = _step4.value;

            if (childResolverArgTc.hasField(baseArgField) && baseArgField !== '_id') {
              childResolverArgTc.extendField(baseArgField, {
                type: baseResolverArgTC.getFieldType(baseArgField)
              });
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
    }
  }
} // reorder input fields resolvers, based on reorderFields opts


function reorderFieldsRecordFilter(resolver, baseDTC, order, fromField) {
  if (order) {
    if (Array.isArray(fromField)) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = fromField[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          const field = _step5.value;
          reorderFieldsRecordFilter(resolver, baseDTC, order, field);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    } else if (fromField && resolver.hasArg(fromField)) {
      const argTC = resolver.getArgTC(fromField);

      if (Array.isArray(order)) {
        argTC.reorderFields(order);
      } else {
        const newOrder = []; // is CDTC

        if (baseDTC.hasInputTypeComposer()) {
          newOrder.push(...baseDTC.getInputTypeComposer().getFieldNames());
          newOrder.filter(value => value === '_id' || value === baseDTC.getDKey());
          newOrder.unshift('_id', baseDTC.getDKey());
        }

        argTC.reorderFields(newOrder);
      }
    }
  }
}

function prepareChildResolvers(baseDTC, childTC, opts) {
  for (const resolverName in _resolvers.EMCResolvers) {
    if (_resolvers.EMCResolvers.hasOwnProperty(resolverName) && childTC.hasResolver(resolverName)) {
      const resolver = childTC.getResolver(resolverName);

      switch (resolverName) {
        case _resolvers.EMCResolvers.createOne:
          setQueryDKey(resolver, childTC, baseDTC.getDKey(), 'record');
          hideDKey(resolver, childTC, baseDTC.getDKey(), 'record');
          break;

        case _resolvers.EMCResolvers.createMany:
          setQueryDKey(resolver, childTC, baseDTC.getDKey(), 'records');
          hideDKey(resolver, childTC, baseDTC.getDKey(), 'records');
          break;

        case _resolvers.EMCResolvers.updateById:
          hideDKey(resolver, childTC, baseDTC.getDKey(), 'record');
          break;

        case _resolvers.EMCResolvers.updateOne:
        case _resolvers.EMCResolvers.updateMany:
          setQueryDKey(resolver, childTC, baseDTC.getDKey(), 'filter');
          hideDKey(resolver, childTC, baseDTC.getDKey(), ['record', 'filter']);
          break;

        case _resolvers.EMCResolvers.findOne:
        case _resolvers.EMCResolvers.findMany:
        case _resolvers.EMCResolvers.removeOne:
        case _resolvers.EMCResolvers.removeMany:
        case _resolvers.EMCResolvers.count:
        case _resolvers.EMCResolvers.pagination:
        case _resolvers.EMCResolvers.connection:
          // limit remove scope to DKey
          setQueryDKey(resolver, childTC, baseDTC.getDKey(), 'filter'); // remove DKey Field, remove from filter

          hideDKey(resolver, childTC, baseDTC.getDKey(), 'filter');
          break;

        default:
      }

      copyResolverArgTypes(resolver, baseDTC, ['filter', 'record', 'records']);
      reorderFieldsRecordFilter(resolver, baseDTC, opts.reorderFields, ['filter', 'record', 'records']);
    }
  }
}