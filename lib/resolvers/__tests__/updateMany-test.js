"use strict";

var _mongoose = require("mongoose");

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../../__mocks__/userModel");

var _updateMany = _interopRequireDefault(require("../updateMany"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('updateMany() ->', () => {
  let UserTC;
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();

    UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
  });
  let user1;
  let user2;
  beforeEach(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    yield _userModel.UserModel.remove({});
    user1 = new _userModel.UserModel({
      name: 'userName1',
      skills: ['js', 'ruby', 'php', 'python'],
      gender: 'male',
      relocation: true
    });
    user2 = new _userModel.UserModel({
      name: 'userName2',
      skills: ['go', 'erlang'],
      gender: 'female',
      relocation: true
    });
    yield Promise.all([user1.save(), user2.save()]);
  }));
  it('should return Resolver object', () => {
    const resolver = (0, _updateMany.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have `filter` arg', () => {
      const resolver = (0, _updateMany.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('filter')).toBe(true);
    });
    it('should have `limit` arg', () => {
      const resolver = (0, _updateMany.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('limit')).toBe(true);
    });
    it('should have `skip` arg', () => {
      const resolver = (0, _updateMany.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('skip')).toBe(true);
    });
    it('should have `sort` arg', () => {
      const resolver = (0, _updateMany.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('sort')).toBe(true);
    });
    it('should have `record` arg', () => {
      const resolver = (0, _updateMany.default)(_userModel.UserModel, UserTC);
      const argConfig = resolver.getArgConfig('record');
      expect(argConfig.type).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(argConfig.type.ofType.name).toBe('UpdateManyUserInput');
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be promise', () => {
      const result = (0, _updateMany.default)(_userModel.UserModel, UserTC).resolve({});
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => 'catch error if appear, hide it from mocha');
    });
    it('should rejected with Error if args.record is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _updateMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {}
      });
      yield expect(result).rejects.toMatchSnapshot();
    }));
    it('should change data via args.record in database',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const checkedName = 'nameForMongoDB';
      yield (0, _updateMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            _id: user1.id
          },
          record: {
            name: checkedName
          }
        }
      });
      yield expect(_userModel.UserModel.findOne({
        _id: user1._id
      })).resolves.toEqual(expect.objectContaining({
        name: checkedName
      }));
    }));
    it('should return payload.numAffected',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _updateMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
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
      const result = yield (0, _updateMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            gender: 'female'
          }
        },
        beforeQuery: query => {
          expect(query).toBeInstanceOf(_mongoose.Query);
          beforeQueryCalled = true; // modify query before execution

          return query.where({
            _id: user1.id
          });
        }
      });
      expect(beforeQueryCalled).toBe(true);
      expect(result.numAffected).toBe(1);
    }));
  });
  describe('Resolver.getType()', () => {
    it('should have correct output type name', () => {
      const outputType = (0, _updateMany.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType.name).toBe(`UpdateMany${UserTC.getTypeName()}Payload`);
    });
    it('should have numAffected field', () => {
      const outputType = (0, _updateMany.default)(_userModel.UserModel, UserTC).getType();
      const numAffectedField = new _graphqlCompose.TypeComposer(outputType).getFieldConfig('numAffected');
      expect(numAffectedField.type).toBe(_graphql.GraphQLInt);
    });
    it('should reuse existed outputType', () => {
      const outputTypeName = `UpdateMany${UserTC.getTypeName()}Payload`;

      const existedType = _graphqlCompose.TypeComposer.create(outputTypeName);

      _graphqlCompose.schemaComposer.set(outputTypeName, existedType);

      const outputType = (0, _updateMany.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType).toBe(existedType.getType());
    });
  });
});