"use strict";

var _mongoose = require("mongoose");

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../../__mocks__/userModel");

var _removeMany = _interopRequireDefault(require("../removeMany"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('removeMany() ->', () => {
  let UserTC;
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();

    UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
  });
  let user1;
  let user2;
  let user3;
  beforeEach(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    yield _userModel.UserModel.remove({});
    user1 = new _userModel.UserModel({
      name: 'userName1',
      gender: 'male',
      relocation: true,
      age: 28
    });
    user2 = new _userModel.UserModel({
      name: 'userName2',
      gender: 'female',
      relocation: true,
      age: 29
    });
    user3 = new _userModel.UserModel({
      name: 'userName3',
      gender: 'female',
      relocation: true,
      age: 30
    });
    yield Promise.all([user1.save(), user2.save(), user3.save()]);
  }));
  it('should return Resolver object', () => {
    const resolver = (0, _removeMany.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have required `filter` arg', () => {
      const resolver = (0, _removeMany.default)(_userModel.UserModel, UserTC);
      const filterField = resolver.getArgConfig('filter');
      expect(filterField).toBeTruthy();
      expect(filterField.type).toBeInstanceOf(_graphql.GraphQLNonNull);
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be promise', () => {
      const result = (0, _removeMany.default)(_userModel.UserModel, UserTC).resolve({});
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => 'catch error if appear, hide it from mocha');
    });
    it('should rejected with Error if args.filter is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _removeMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {}
      });
      yield expect(result).rejects.toMatchSnapshot();
    }));
    it('should remove data in database',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      yield (0, _removeMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            _id: user1.id
          }
        }
      });
      yield expect(_userModel.UserModel.findOne({
        _id: user1._id
      })).resolves.toBeNull();
    }));
    it('should not remove unsuitable data to filter in database',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      yield (0, _removeMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            _id: user1.id
          }
        }
      });
      yield expect(_userModel.UserModel.findOne({
        _id: user2._id
      })).resolves.toBeDefined();
    }));
    it('should return payload.numAffected',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _removeMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            gender: 'female'
          }
        }
      });
      expect(result.numAffected).toBe(2);
    }));
    it('should call `beforeQuery` method with non-executed `query` as arg',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      let beforeQueryCalled = false;
      const result = yield (0, _removeMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            gender: 'female'
          }
        },
        beforeQuery: query => {
          expect(query).toBeInstanceOf(_mongoose.Query);
          beforeQueryCalled = true;
          return query;
        }
      });
      expect(beforeQueryCalled).toBe(true);
      expect(result.numAffected).toBe(2);
    }));
  });
  describe('Resolver.getType()', () => {
    it('should have correct output type name', () => {
      const outputType = (0, _removeMany.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType.name).toBe(`RemoveMany${UserTC.getTypeName()}Payload`);
    });
    it('should have numAffected field', () => {
      const outputType = (0, _removeMany.default)(_userModel.UserModel, UserTC).getType();
      const numAffectedField = new _graphqlCompose.TypeComposer(outputType).getFieldConfig('numAffected');
      expect(numAffectedField.type).toBe(_graphql.GraphQLInt);
    });
    it('should reuse existed outputType', () => {
      const outputTypeName = `RemoveMany${UserTC.getTypeName()}Payload`;

      const existedType = _graphqlCompose.TypeComposer.create('outputTypeName');

      _graphqlCompose.schemaComposer.set(outputTypeName, existedType);

      const outputType = (0, _removeMany.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType).toBe(existedType.getType());
    });
  });
});