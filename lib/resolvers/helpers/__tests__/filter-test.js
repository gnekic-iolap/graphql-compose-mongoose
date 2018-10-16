"use strict";

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _filter = require("../filter");

var _filterOperators = require("../filterOperators");

var _mongoid = _interopRequireDefault(require("../../../types/mongoid"));

var _userModel = require("../../../__mocks__/userModel");

var _fieldsConverter = require("../../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

describe('Resolver helper `filter` ->', () => {
  let UserTC;
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();

    UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
  });
  describe('filterHelperArgs()', () => {
    it('should throw error if first arg is not TypeComposer', () => {
      expect(() => {
        const wrongArgs = [{}];
        (0, _filter.filterHelperArgs)(...wrongArgs);
      }).toThrowError('should be instance of TypeComposer');
    });
    it('should throw error if second arg is not MongooseModel', () => {
      expect(() => {
        const wrongArgs = [UserTC, {}];
        (0, _filter.filterHelperArgs)(...wrongArgs);
      }).toThrowError('should be instance of MongooseModel');
    });
    it('should throw error if `filterTypeName` not provided in opts', () => {
      expect(() => (0, _filter.filterHelperArgs)(UserTC, _userModel.UserModel)).toThrowError('provide non-empty `filterTypeName`');
    });
    it('should return filter field', () => {
      const args = (0, _filter.filterHelperArgs)(UserTC, _userModel.UserModel, {
        filterTypeName: 'FilterUserType'
      });
      expect(args.filter.type).toBeInstanceOf(_graphql.GraphQLInputObjectType);
    });
    it('should return filter with field _ids', () => {
      const args = (0, _filter.filterHelperArgs)(UserTC, _userModel.UserModel, {
        filterTypeName: 'FilterUserType'
      });
      const itc = new _graphqlCompose.InputTypeComposer(args.filter.type);
      const ft = itc.getFieldType('_ids');
      expect(ft).toBeInstanceOf(_graphql.GraphQLList);
      expect(ft.ofType).toBe(_mongoid.default);
    });
    it('should for opts.isRequired=true return GraphQLNonNull', () => {
      const args = (0, _filter.filterHelperArgs)(UserTC, _userModel.UserModel, {
        filterTypeName: 'FilterUserType',
        isRequired: true
      });
      expect(args.filter.type).toBeInstanceOf(_graphql.GraphQLNonNull);
    });
    it('should remove fields via opts.removeFields', () => {
      const args = (0, _filter.filterHelperArgs)(UserTC, _userModel.UserModel, {
        filterTypeName: 'FilterUserType',
        removeFields: ['name', 'age']
      });
      const itc = new _graphqlCompose.InputTypeComposer(args.filter.type);
      expect(itc.hasField('name')).toBe(false);
      expect(itc.hasField('age')).toBe(false);
      expect(itc.hasField('gender')).toBe(true);
    });
    it('should set required fields via opts.requiredFields', () => {
      const args = (0, _filter.filterHelperArgs)(UserTC, _userModel.UserModel, {
        filterTypeName: 'FilterUserType',
        requiredFields: ['name', 'age']
      });
      const itc = new _graphqlCompose.InputTypeComposer(args.filter.type);
      expect(itc.getFieldType('name')).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(itc.getFieldType('age')).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(itc.getFieldType('gender')).not.toBeInstanceOf(_graphql.GraphQLNonNull);
    });
    it('should leave only indexed fields if opts.onlyIndexed=true', () => {
      const args = (0, _filter.filterHelperArgs)(UserTC, _userModel.UserModel, {
        filterTypeName: 'FilterUserType',
        onlyIndexed: true,
        model: _userModel.UserModel
      });
      const itc = new _graphqlCompose.InputTypeComposer(args.filter.type);
      expect(itc.hasField('_id')).toBe(true);
      expect(itc.hasField('name')).toBe(true);
      expect(itc.hasField('age')).toBe(false);
      expect(itc.hasField('gender')).toBe(false);
    });
    it('should opts.onlyIndexed=true and opts.removeFields works together', () => {
      const args = (0, _filter.filterHelperArgs)(UserTC, _userModel.UserModel, {
        filterTypeName: 'FilterUserType',
        onlyIndexed: true,
        model: _userModel.UserModel,
        removeFields: ['name']
      });
      const itc = new _graphqlCompose.InputTypeComposer(args.filter.type);
      expect(itc.hasField('_id')).toBe(true);
      expect(itc.hasField('name')).toBe(false);
      expect(itc.hasField('age')).toBe(false);
      expect(itc.hasField('gender')).toBe(false);
    });
  });
  describe('filterHelper()', () => {
    let spyWhereFn;
    let spyFindFn;
    let resolveParams;
    beforeEach(() => {
      spyWhereFn = jest.fn(() => {
        return resolveParams.query;
      });
      spyFindFn = jest.fn();
      resolveParams = {
        query: _objectSpread({}, _userModel.UserModel.find(), {
          where: spyWhereFn,
          find: spyFindFn
        })
      };
    });
    it('should not call query.where if args.filter is empty', () => {
      (0, _filter.filterHelper)(resolveParams);
      expect(spyWhereFn).not.toBeCalled();
    });
    it('should call query.where if args.filter is provided', () => {
      resolveParams.args = {
        filter: {
          name: 'nodkz'
        }
      };
      (0, _filter.filterHelper)(resolveParams);
      expect(spyWhereFn).toBeCalledWith({
        name: 'nodkz'
      });
    });
    it('should call query.where if args.filter provided with _ids', () => {
      resolveParams.args = {
        filter: {
          age: 30,
          _ids: [1, 2, 3]
        }
      };
      (0, _filter.filterHelper)(resolveParams);
      expect(spyWhereFn.mock.calls).toEqual([[{
        _id: {
          $in: [1, 2, 3]
        }
      }], [{
        age: 30
      }]]);
    });
    it('should convert deep object in args.filter to dotted object', () => {
      resolveParams.args = {
        filter: {
          name: {
            first: 'Pavel'
          },
          age: 30
        }
      };
      (0, _filter.filterHelper)(resolveParams);
      expect(spyWhereFn).toBeCalledWith({
        'name.first': 'Pavel',
        age: 30
      });
    });
    it('should call query.find if args.filter.OPERATORS_FIELDNAME is provided', () => {
      resolveParams.args = {
        filter: {
          [_filterOperators.OPERATORS_FIELDNAME]: {
            age: {
              gt: 10,
              lt: 20
            }
          }
        }
      };
      (0, _filter.filterHelper)(resolveParams);
      expect(spyWhereFn).toBeCalledWith({
        age: {
          $gt: 10,
          $lt: 20
        }
      });
    });
    it('should add rawQuery to query', () => {
      resolveParams.args = {
        filter: {
          [_filterOperators.OPERATORS_FIELDNAME]: {
            age: {
              gt: 10,
              lt: 20
            }
          }
        }
      };
      resolveParams.rawQuery = {
        age: {
          max: 30
        },
        active: true
      };
      (0, _filter.filterHelper)(resolveParams);
      expect(spyWhereFn.mock.calls).toEqual([[{
        age: {
          $gt: 10,
          $lt: 20
        }
      }], [{
        active: true,
        age: {
          max: 30
        }
      }]]);
    });
  });
});