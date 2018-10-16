"use strict";

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../../__mocks__/userModel");

var _postModel = require("../../__mocks__/postModel");

var _findByIds = _interopRequireDefault(require("../findByIds"));

var _mongoid = _interopRequireDefault(require("../../types/mongoid"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('findByIds() ->', () => {
  let UserTC;
  let PostTypeComposer;
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();

    UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
    PostTypeComposer = (0, _fieldsConverter.convertModelToGraphQL)(_postModel.PostModel, 'Post', _graphqlCompose.schemaComposer);
  });
  let user1;
  let user2;
  let user3;
  let post1;
  let post2;
  let post3;
  beforeEach(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    yield _userModel.UserModel.remove({});
    user1 = new _userModel.UserModel({
      name: 'nodkz1'
    });
    user2 = new _userModel.UserModel({
      name: 'nodkz2'
    });
    user3 = new _userModel.UserModel({
      name: 'nodkz3'
    });
    yield Promise.all([user1.save(), user2.save(), user3.save()]);
    yield _postModel.PostModel.remove({});
    post1 = new _postModel.PostModel({
      _id: 1,
      title: 'Post 1'
    });
    post2 = new _postModel.PostModel({
      _id: 2,
      title: 'Post 2'
    });
    post3 = new _postModel.PostModel({
      _id: 3,
      title: 'Post 3'
    });
    yield Promise.all([post1.save(), post2.save(), post3.save()]);
  }));
  it('should return Resolver object', () => {
    const resolver = (0, _findByIds.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have non-null `_ids` arg', () => {
      const resolver = (0, _findByIds.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('_ids')).toBe(true);
      const argConfig = resolver.getArgConfig('_ids');
      expect(argConfig.type).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(argConfig.type.ofType).toBeInstanceOf(_graphql.GraphQLList);
      expect(argConfig.type.ofType.ofType).toBe(_mongoid.default);
    });
    it('should have `limit` arg', () => {
      const resolver = (0, _findByIds.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('limit')).toBe(true);
    });
    it('should have `sort` arg', () => {
      const resolver = (0, _findByIds.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('sort')).toBe(true);
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be fulfilled promise',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _findByIds.default)(_userModel.UserModel, UserTC).resolve({});
      yield expect(result).resolves.toBeDefined();
    }));
    it('should return empty array if args._ids is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findByIds.default)(_userModel.UserModel, UserTC).resolve({});
      expect(result).toBeInstanceOf(Array);
      expect(Object.keys(result)).toHaveLength(0);
    }));
    it('should return array of documents',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findByIds.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _ids: [user1._id, user2._id, user3._id]
        }
      });
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(3);
      expect(result.map(d => d.name)).toEqual(expect.arrayContaining([user1.name, user2.name, user3.name]));
    }));
    it('should return array of documents if object id is string',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const stringId = `${user1._id}`;
      const result = yield (0, _findByIds.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _ids: [stringId]
        }
      });
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
    }));
    it('should return array of documents if args._ids are integers',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findByIds.default)(_postModel.PostModel, PostTypeComposer).resolve({
        args: {
          _ids: [1, 2, 3]
        }
      });
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(3);
    }));
    it('should return mongoose documents',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findByIds.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _ids: [user1._id, user2._id]
        }
      });
      expect(result[0]).toBeInstanceOf(_userModel.UserModel);
      expect(result[1]).toBeInstanceOf(_userModel.UserModel);
    }));
  });
});