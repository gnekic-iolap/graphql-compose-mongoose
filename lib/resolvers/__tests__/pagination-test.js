"use strict";

var _graphqlCompose = require("graphql-compose");

var _userModel = require("../../__mocks__/userModel");

var _pagination = _interopRequireDefault(require("../pagination"));

var _findMany = _interopRequireDefault(require("../findMany"));

var _count = _interopRequireDefault(require("../count"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('pagination() ->', () => {
  let UserTC;
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();

    UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
    UserTC.setResolver('findMany', (0, _findMany.default)(_userModel.UserModel, UserTC));
    UserTC.setResolver('count', (0, _count.default)(_userModel.UserModel, UserTC));
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
    const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  it('Resolver object should have `filter` arg', () => {
    const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
    if (!resolver) throw new Error('Pagination resolver is undefined');
    expect(resolver.hasArg('filter')).toBe(true);
  });
  it('Resolver object should have `page` arg', () => {
    const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
    if (!resolver) throw new Error('Pagination resolver is undefined');
    expect(resolver.hasArg('page')).toBe(true);
  });
  it('Resolver object should have `perPage` arg', () => {
    const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
    if (!resolver) throw new Error('Pagination resolver is undefined');
    expect(resolver.hasArg('perPage')).toBe(true);
    expect(resolver.getArgConfig('perPage').defaultValue).toBe(20);
  });
  it('Resolver object should have `perPage` arg with custom default value', () => {
    const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC, {
      perPage: 33
    });
    if (!resolver) throw new Error('Pagination resolver is undefined');
    expect(resolver.hasArg('perPage')).toBe(true);
    expect(resolver.getArgConfig('perPage').defaultValue).toBe(33);
  });
  it('Resolver object should have `sort` arg', () => {
    const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
    if (!resolver) throw new Error('Pagination resolver is undefined');
    expect(resolver.hasArg('sort')).toBe(true);
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be fulfilled Promise',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
      if (!resolver) throw new Error('Pagination resolver is undefined');
      const result = resolver.resolve({
        args: {
          page: 1,
          perPage: 20
        }
      });
      yield expect(result).resolves.toBeDefined();
    }));
    it('should return array of documents in `items`',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
      if (!resolver) throw new Error('Pagination resolver is undefined');
      const result = yield resolver.resolve({
        args: {
          page: 1,
          perPage: 20
        }
      });
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items).toHaveLength(2);
      expect(result.items.map(d => d.name)).toEqual(expect.arrayContaining([user1.name, user2.name]));
    }));
    it('should limit records',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
      if (!resolver) throw new Error('Pagination resolver is undefined');
      const result = yield resolver.resolve({
        args: {
          page: 1,
          perPage: 1
        }
      });
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items).toHaveLength(1);
    }));
    it('should skip records',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
      if (!resolver) throw new Error('Pagination resolver is undefined');
      const result = yield resolver.resolve({
        args: {
          page: 999,
          perPage: 10
        }
      });
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items).toHaveLength(0);
    }));
    it('should sort records',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
      if (!resolver) throw new Error('Pagination resolver is undefined');
      const result1 = yield resolver.resolve({
        args: {
          sort: {
            _id: 1
          },
          page: 1,
          perPage: 20
        }
      });
      const result2 = yield resolver.resolve({
        args: {
          sort: {
            _id: -1
          },
          page: 1,
          perPage: 20
        }
      });
      expect(`${result1.items[0]._id}`).not.toBe(`${result2.items[0]._id}`);
    }));
    it('should return mongoose documents',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const resolver = (0, _pagination.default)(_userModel.UserModel, UserTC);
      if (!resolver) throw new Error('Pagination resolver is undefined');
      const result = yield resolver.resolve({
        args: {
          page: 1,
          perPage: 20
        }
      });
      expect(result.items[0]).toBeInstanceOf(_userModel.UserModel);
      expect(result.items[1]).toBeInstanceOf(_userModel.UserModel);
    }));
  });
});