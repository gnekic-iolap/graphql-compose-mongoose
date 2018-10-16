"use strict";

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../../__mocks__/userModel");

var _count = _interopRequireDefault(require("../count"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('count() ->', () => {
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
    const resolver = (0, _count.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have `filter` arg', () => {
      const resolver = (0, _count.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('filter')).toBe(true);
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be fulfilled promise',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _count.default)(_userModel.UserModel, UserTC).resolve({});
      yield expect(result).resolves.toBeDefined();
    }));
    it('should return total number of documents in collection if args is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _count.default)(_userModel.UserModel, UserTC).resolve({
        args: {}
      });
      expect(result).toBe(2);
    }));
    it('should return number of document by filter data',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _count.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            gender: 'male'
          }
        }
      });
      expect(result).toBe(1);
    }));
  });
  describe('Resolver.getType()', () => {
    it('should return GraphQLInt type', () => {
      const outputType = (0, _count.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType).toBe(_graphql.GraphQLInt);
    });
  });
});