"use strict";

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../../__mocks__/userModel");

var _postModel = require("../../__mocks__/postModel");

var _findById = _interopRequireDefault(require("../findById"));

var _mongoid = _interopRequireDefault(require("../../types/mongoid"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('findById() ->', () => {
  let UserTC;
  let PostTypeComposer;
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();

    UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
    PostTypeComposer = (0, _fieldsConverter.convertModelToGraphQL)(_postModel.PostModel, 'Post', _graphqlCompose.schemaComposer);
  });
  let user;
  let post;
  beforeEach(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    yield _userModel.UserModel.remove({});
    user = new _userModel.UserModel({
      name: 'nodkz'
    });
    yield user.save();
    yield _postModel.PostModel.remove({});
    post = new _postModel.PostModel({
      _id: 1,
      title: 'Post 1'
    });
    yield post.save();
  }));
  it('should return Resolver object', () => {
    const resolver = (0, _findById.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have non-null `_id` arg', () => {
      const resolver = (0, _findById.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('_id')).toBe(true);
      const argConfig = resolver.getArgConfig('_id');
      expect(argConfig.type).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(argConfig.type.ofType).toBe(_mongoid.default);
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be fulfilled promise',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _findById.default)(_userModel.UserModel, UserTC).resolve({});
      yield expect(result).resolves.toBeDefined();
    }));
    it('should be rejected if args.id is not objectId',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _findById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: 1
        }
      });
      yield expect(result).rejects.toBeDefined();
    }));
    it('should return null if args.id is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findById.default)(_userModel.UserModel, UserTC).resolve({});
      expect(result).toBe(null);
    }));
    it('should return document if provided existed id',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: user._id
        }
      });
      expect(result.name).toBe(user.name);
    }));
    it('should return mongoose document',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: user._id
        }
      });
      expect(result).toBeInstanceOf(_userModel.UserModel);
    }));
    it('should return mongoose Post document',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _findById.default)(_postModel.PostModel, PostTypeComposer).resolve({
        args: {
          _id: 1
        }
      });
      expect(result).toBeInstanceOf(_postModel.PostModel);
    }));
  });
});