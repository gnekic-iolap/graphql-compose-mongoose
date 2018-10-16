"use strict";

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../../__mocks__/userModel");

var _findOne = _interopRequireDefault(require("../findOne"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
let UserTC;
let user1;
let user2;
beforeEach(
/*#__PURE__*/
_asyncToGenerator(function* () {
  _graphqlCompose.schemaComposer.clear();

  UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
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
    relocation: false
  });
  yield Promise.all([user1.save(), user2.save()]);
}));
describe('findOne() ->', () => {
  it('should return Resolver object', () => {
    const resolver = (0, _findOne.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have `filter` arg', () => {
      const resolver = (0, _findOne.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('filter')).toBe(true);
    });
    it('should have `filter` arg only with indexed fields',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const resolver = (0, _findOne.default)(_userModel.UserModel, UserTC, {
        filter: {
          onlyIndexed: true,
          operators: false
        }
      });
      expect(resolver.getArgTC('filter').getFieldNames()).toEqual(expect.arrayContaining(['_id', 'name', 'employment']));
    }));
    it('should have `filter` arg with required `name` field',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const resolver = (0, _findOne.default)(_userModel.UserModel, UserTC, {
        filter: {
          requiredFields: 'name'
        }
      });
      expect(resolver.getArgTC('filter').getFieldType('name')).toBeInstanceOf(_graphql.GraphQLNonNull);
    }));
    it('should have `skip` arg', () => {
      const resolver = (0, _findOne.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('skip')).toBe(true);
    });
    it('should have `sort` arg', () => {
      const resolver = (0, _findOne.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('sort')).toBe(true);
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be fulfilled promise',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _findOne.default)(_userModel.UserModel, UserTC).resolve({});
      yield expect(result).resolves.toBeDefined();
    }));
    it('should return one document if args is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {}
      });
      expect(typeof result).toBe('object');
      expect([user1.name, user2.name]).toContain(result.name);
    }));
    it('should return document if provided existed id',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          id: user1._id
        }
      });
      expect(result.name).toBe(user1.name);
    }));
    it('should skip records',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          skip: 2000
        }
      });
      expect(result).toBeNull();
    }));
    it('should sort records',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result1 = yield (0, _findOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          sort: {
            _id: 1
          }
        }
      });
      const result2 = yield (0, _findOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          sort: {
            _id: -1
          }
        }
      });
      expect(`${result1._id}`).not.toBe(`${result2._id}`);
    }));
    it('should return mongoose document',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: user1._id
        }
      });
      expect(result).toBeInstanceOf(_userModel.UserModel);
    }));
  });
  describe('Resolver.getType()', () => {
    it('should return model type', () => {
      const outputType = (0, _findOne.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType).toBe(UserTC.getType());
    });
  });
});