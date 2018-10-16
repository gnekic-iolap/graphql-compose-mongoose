"use strict";

var _graphqlCompose = require("graphql-compose");

var _userModel = require("../../__mocks__/userModel");

var _findMany = _interopRequireDefault(require("../findMany"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('findMany() ->', () => {
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
      relocation: false
    });
    yield Promise.all([user1.save(), user2.save()]);
  }));
  it('should return Resolver object', () => {
    const resolver = (0, _findMany.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  it('Resolver object should have `filter` arg', () => {
    const resolver = (0, _findMany.default)(_userModel.UserModel, UserTC);
    expect(resolver.hasArg('filter')).toBe(true);
  });
  it('Resolver object should have `limit` arg', () => {
    const resolver = (0, _findMany.default)(_userModel.UserModel, UserTC);
    expect(resolver.hasArg('limit')).toBe(true);
  });
  it('Resolver object should have `skip` arg', () => {
    const resolver = (0, _findMany.default)(_userModel.UserModel, UserTC);
    expect(resolver.hasArg('skip')).toBe(true);
  });
  it('Resolver object should have `sort` arg', () => {
    const resolver = (0, _findMany.default)(_userModel.UserModel, UserTC);
    expect(resolver.hasArg('sort')).toBe(true);
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be fulfilled Promise',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _findMany.default)(_userModel.UserModel, UserTC).resolve({});
      yield expect(result).resolves.toBeDefined();
    }));
    it('should return array of documents if args is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findMany.default)(_userModel.UserModel, UserTC).resolve({});
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(2);
      expect(result.map(d => d.name)).toEqual(expect.arrayContaining([user1.name, user2.name]));
    }));
    it('should limit records',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          limit: 1
        }
      });
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    }));
    it('should skip records',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          skip: 1000
        }
      });
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    }));
    it('should sort records',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result1 = yield (0, _findMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          sort: {
            _id: 1
          }
        }
      });
      const result2 = yield (0, _findMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          sort: {
            _id: -1
          }
        }
      });
      expect(`${result1[0]._id}`).not.toBe(`${result2[0]._id}`);
    }));
    it('should return mongoose documents',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          limit: 2
        }
      });
      expect(result[0]).toBeInstanceOf(_userModel.UserModel);
      expect(result[1]).toBeInstanceOf(_userModel.UserModel);
    }));
  });
});