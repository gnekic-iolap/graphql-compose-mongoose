"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiscriminatorTypeComposer = void 0;

var _graphqlCompose = require("graphql-compose");

var _composeWithMongoose = require("../composeWithMongoose");

var _composeChildTC = require("./composeChildTC");

var _mergeCustomizationOptions = require("./utils/mergeCustomizationOptions");

var _prepareBaseResolvers = require("./prepareBaseResolvers");

var _reorderFields = require("./utils/reorderFields");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// sets the values on DKey enum TC
function setDKeyETCValues(discriminators) {
  const values = {};

  for (const DName in discriminators) {
    if (discriminators.hasOwnProperty(DName)) {
      values[DName] = {
        value: DName
      };
    }
  }

  return values;
} // creates an enum from discriminator names
// then sets this enum type as the discriminator key field type


function createAndSetDKeyETC(dTC, discriminators) {
  const DKeyETC = _graphqlCompose.EnumTypeComposer.create({
    name: `EnumDKey${dTC.getTypeName()}${dTC.getDKey()[0].toUpperCase() + dTC.getDKey().substr(1)}`,
    values: setDKeyETCValues(discriminators)
  }); // set on Output


  dTC.extendField(dTC.getDKey(), {
    type: () => DKeyETC
  }); // set on Input

  dTC.getInputTypeComposer().extendField(dTC.getDKey(), {
    type: () => DKeyETC
  });
  return DKeyETC;
}

class DiscriminatorTypeComposer extends _graphqlCompose.TypeComposerClass {
  static _getClassConnectedWithSchemaComposer(sc) {
    class _DiscriminatorTypeComposer extends DiscriminatorTypeComposer {}

    _defineProperty(_DiscriminatorTypeComposer, "schemaComposer", sc || _graphqlCompose.schemaComposer);

    return _DiscriminatorTypeComposer;
  }
  /* ::
  constructor(gqType: any): DiscriminatorTypeComposer<TContext> {
    super(gqType);
    return this;
  }
  */


  static createFromModel(baseModel, opts) {
    if (!baseModel || !baseModel.discriminators) {
      throw Error('Discriminator Key not Set, Use composeWithMongoose for Normal Collections');
    } // eslint-disable-next-line


    opts = _objectSpread({
      reorderFields: true,
      schemaComposer: _graphqlCompose.schemaComposer
    }, opts);
    const baseTC = (0, _composeWithMongoose.composeWithMongoose)(baseModel, opts);

    const _DiscriminatorTypeComposer = this._getClassConnectedWithSchemaComposer(opts.schemaComposer);

    const baseDTC = new _DiscriminatorTypeComposer(baseTC.getType());
    baseDTC.opts = opts;
    baseDTC.childTCs = [];
    baseDTC.discriminatorKey = baseModel.schema.get('discriminatorKey') || '__t'; // discriminators an object containing all discriminators with key being DNames

    baseDTC.DKeyETC = createAndSetDKeyETC(baseDTC, baseModel.discriminators);
    (0, _reorderFields.reorderFields)(baseDTC, baseDTC.opts.reorderFields, baseDTC.discriminatorKey);
    baseDTC.DInterface = baseDTC._createDInterface(baseDTC);
    baseDTC.setInterfaces([baseDTC.DInterface]);
    baseDTC.schemaComposer.addSchemaMustHaveType(baseDTC); // prepare Base Resolvers

    (0, _prepareBaseResolvers.prepareBaseResolvers)(baseDTC);
    return baseDTC;
  }

  _createDInterface(baseTC) {
    return this.schemaComposer.InterfaceTypeComposer.create({
      name: `${baseTC.getTypeName()}Interface`,
      resolveType: value => {
        const childDName = value[baseTC.getDKey()];

        if (childDName) {
          return baseTC.schemaComposer.getTC(childDName).getType();
        } // as fallback return BaseModelTC


        return baseTC.schemaComposer.getTC(baseTC.getTypeName()).getType();
      },
      fields: () => {
        const baseFields = baseTC.getFieldNames();
        const interfaceFields = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = baseFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            const field = _step.value;
            interfaceFields[field] = baseTC.getFieldConfig(field);
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

        return interfaceFields;
      }
    });
  }

  getDKey() {
    return this.discriminatorKey;
  }

  getDKeyETC() {
    return this.DKeyETC;
  }

  getDInterface() {
    return this.DInterface;
  }

  hasChildTC(DName) {
    return !!this.childTCs.find(ch => ch.getTypeName() === DName);
  }

  setFields(fields) {
    const oldFieldNames = super.getFieldNames();
    super.setFields(fields);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = this.childTCs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        const childTC = _step2.value;
        childTC.removeField(oldFieldNames);
        childTC.addFields(fields);
        (0, _reorderFields.reorderFields)(childTC, this.opts.reorderFields, this.getDKey(), super.getFieldNames());
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

    return this;
  }

  setField(fieldName, fieldConfig) {
    super.setField(fieldName, fieldConfig);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = this.childTCs[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        const childTC = _step3.value;
        childTC.setField(fieldName, fieldConfig);
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

    return this;
  } // discriminators must have all interface fields


  addFields(newFields) {
    super.addFields(newFields);
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = this.childTCs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        const childTC = _step4.value;
        childTC.addFields(newFields);
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

    return this;
  }

  addNestedFields(newFields) {
    super.addNestedFields(newFields);
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = this.childTCs[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        const childTC = _step5.value;
        childTC.addNestedFields(newFields);
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

    return this;
  }

  removeField(fieldNameOrArray) {
    super.removeField(fieldNameOrArray);
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = this.childTCs[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        const childTC = _step6.value;
        childTC.removeField(fieldNameOrArray);
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }

    return this;
  }

  removeOtherFields(fieldNameOrArray) {
    const oldFieldNames = super.getFieldNames();
    super.removeOtherFields(fieldNameOrArray);
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = this.childTCs[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        const childTC = _step7.value;
        const specificFields = childTC.getFieldNames().filter(childFieldName => !oldFieldNames.find(oldBaseFieldName => oldBaseFieldName === childFieldName));
        childTC.removeOtherFields(super.getFieldNames().concat(specificFields));
        (0, _reorderFields.reorderFields)(childTC, this.opts.reorderFields, this.getDKey(), super.getFieldNames());
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7.return != null) {
          _iterator7.return();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }

    return this;
  }

  extendField(fieldName, partialFieldConfig) {
    super.extendField(fieldName, partialFieldConfig);
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = this.childTCs[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        const childTC = _step8.value;
        childTC.extendField(fieldName, partialFieldConfig);
      }
    } catch (err) {
      _didIteratorError8 = true;
      _iteratorError8 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion8 && _iterator8.return != null) {
          _iterator8.return();
        }
      } finally {
        if (_didIteratorError8) {
          throw _iteratorError8;
        }
      }
    }

    return this;
  }

  reorderFields(names) {
    super.reorderFields(names);
    var _iteratorNormalCompletion9 = true;
    var _didIteratorError9 = false;
    var _iteratorError9 = undefined;

    try {
      for (var _iterator9 = this.childTCs[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
        const childTC = _step9.value;
        childTC.reorderFields(names);
      }
    } catch (err) {
      _didIteratorError9 = true;
      _iteratorError9 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion9 && _iterator9.return != null) {
          _iterator9.return();
        }
      } finally {
        if (_didIteratorError9) {
          throw _iteratorError9;
        }
      }
    }

    return this;
  }

  makeFieldNonNull(fieldNameOrArray) {
    super.makeFieldNonNull(fieldNameOrArray);
    var _iteratorNormalCompletion10 = true;
    var _didIteratorError10 = false;
    var _iteratorError10 = undefined;

    try {
      for (var _iterator10 = this.childTCs[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
        const childTC = _step10.value;
        childTC.makeFieldNonNull(fieldNameOrArray);
      }
    } catch (err) {
      _didIteratorError10 = true;
      _iteratorError10 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion10 && _iterator10.return != null) {
          _iterator10.return();
        }
      } finally {
        if (_didIteratorError10) {
          throw _iteratorError10;
        }
      }
    }

    return this;
  }

  makeFieldNullable(fieldNameOrArray) {
    super.makeFieldNullable(fieldNameOrArray);
    var _iteratorNormalCompletion11 = true;
    var _didIteratorError11 = false;
    var _iteratorError11 = undefined;

    try {
      for (var _iterator11 = this.childTCs[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
        const childTC = _step11.value;
        childTC.makeFieldNullable(fieldNameOrArray);
      }
    } catch (err) {
      _didIteratorError11 = true;
      _iteratorError11 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion11 && _iterator11.return != null) {
          _iterator11.return();
        }
      } finally {
        if (_didIteratorError11) {
          throw _iteratorError11;
        }
      }
    }

    return this;
  }

  deprecateFields(fields) {
    super.deprecateFields(fields);
    var _iteratorNormalCompletion12 = true;
    var _didIteratorError12 = false;
    var _iteratorError12 = undefined;

    try {
      for (var _iterator12 = this.childTCs[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
        const childTC = _step12.value;
        childTC.deprecateFields(fields);
      }
    } catch (err) {
      _didIteratorError12 = true;
      _iteratorError12 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion12 && _iterator12.return != null) {
          _iterator12.return();
        }
      } finally {
        if (_didIteratorError12) {
          throw _iteratorError12;
        }
      }
    }

    return this;
  } // relations with args are a bit hard to manage as interfaces i believe as of now do not
  // support field args. Well if one wants to have use args, you setType for resolver as this
  // this = this DiscriminantTypeComposer
  // NOTE, those relations will be propagated to the childTypeComposers and you can use normally.


  addRelation(fieldName, relationOpts) {
    super.addRelation(fieldName, relationOpts);
    var _iteratorNormalCompletion13 = true;
    var _didIteratorError13 = false;
    var _iteratorError13 = undefined;

    try {
      for (var _iterator13 = this.childTCs[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
        const childTC = _step13.value;
        childTC.addRelation(fieldName, relationOpts);
      }
    } catch (err) {
      _didIteratorError13 = true;
      _iteratorError13 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion13 && _iterator13.return != null) {
          _iterator13.return();
        }
      } finally {
        if (_didIteratorError13) {
          throw _iteratorError13;
        }
      }
    }

    return this;
  }

  setRecordIdFn(fn) {
    super.setRecordIdFn(fn);
    var _iteratorNormalCompletion14 = true;
    var _didIteratorError14 = false;
    var _iteratorError14 = undefined;

    try {
      for (var _iterator14 = this.childTCs[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
        const childTC = _step14.value;
        childTC.setRecordIdFn(fn);
      }
    } catch (err) {
      _didIteratorError14 = true;
      _iteratorError14 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion14 && _iterator14.return != null) {
          _iterator14.return();
        }
      } finally {
        if (_didIteratorError14) {
          throw _iteratorError14;
        }
      }
    }

    return this;
  }
  /* eslint no-use-before-define: 0 */


  discriminator(childModel, opts) {
    const customizationOpts = (0, _mergeCustomizationOptions.mergeCustomizationOptions)(this.opts, opts);
    let childTC = (0, _composeWithMongoose.composeWithMongoose)(childModel, customizationOpts);
    childTC = (0, _composeChildTC.composeChildTC)(this, childTC, this.opts);
    this.schemaComposer.addSchemaMustHaveType(childTC);
    this.childTCs.push(childTC);
    return childTC;
  }

}

exports.DiscriminatorTypeComposer = DiscriminatorTypeComposer;