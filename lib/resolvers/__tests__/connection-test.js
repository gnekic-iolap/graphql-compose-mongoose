"use strict";

var _graphqlCompose = require("graphql-compose");

var _userModel = require("../../__mocks__/userModel");

var _connection = _interopRequireWildcard(require("../connection"));

var _findMany = _interopRequireDefault(require("../findMany"));

var _count = _interopRequireDefault(require("../count"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('connection() resolver', () => {
  describe('prepareCursorQuery()', () => {
    let rawQuery;
    describe('single index', () => {
      const cursorData = {
        a: 10
      };
      const indexKeys = Object.keys(cursorData);
      it('asc order', () => {
        const indexData = {
          a: 1
        }; // for beforeCursorQuery

        rawQuery = {};
        (0, _connection.prepareCursorQuery)(rawQuery, cursorData, indexKeys, indexData, '$lt', '$gt');
        expect(rawQuery).toEqual({
          a: {
            $lt: 10
          }
        }); // for afterCursorQuery

        rawQuery = {};
        (0, _connection.prepareCursorQuery)(rawQuery, cursorData, indexKeys, indexData, '$gt', '$lt');
        expect(rawQuery).toEqual({
          a: {
            $gt: 10
          }
        });
      });
      it('desc order', () => {
        const indexData = {
          a: -1
        }; // for beforeCursorQuery

        rawQuery = {};
        (0, _connection.prepareCursorQuery)(rawQuery, cursorData, indexKeys, indexData, '$lt', '$gt');
        expect(rawQuery).toEqual({
          a: {
            $gt: 10
          }
        }); // for afterCursorQuery

        rawQuery = {};
        (0, _connection.prepareCursorQuery)(rawQuery, cursorData, indexKeys, indexData, '$gt', '$lt');
        expect(rawQuery).toEqual({
          a: {
            $lt: 10
          }
        });
      });
    });
    describe('compound index', () => {
      const cursorData = {
        a: 10,
        b: 100,
        c: 1000
      };
      const indexKeys = Object.keys(cursorData);
      it('asc order', () => {
        const indexData = {
          a: 1,
          b: -1,
          c: 1
        }; // for beforeCursorQuery

        rawQuery = {};
        (0, _connection.prepareCursorQuery)(rawQuery, cursorData, indexKeys, indexData, '$lt', '$gt');
        expect(rawQuery).toEqual({
          $or: [{
            a: 10,
            b: 100,
            c: {
              $lt: 1000
            }
          }, {
            a: 10,
            b: {
              $gt: 100
            }
          }, {
            a: {
              $lt: 10
            }
          }]
        }); // for afterCursorQuery

        rawQuery = {};
        (0, _connection.prepareCursorQuery)(rawQuery, cursorData, indexKeys, indexData, '$gt', '$lt');
        expect(rawQuery).toEqual({
          $or: [{
            a: 10,
            b: 100,
            c: {
              $gt: 1000
            }
          }, {
            a: 10,
            b: {
              $lt: 100
            }
          }, {
            a: {
              $gt: 10
            }
          }]
        });
      });
      it('desc order', () => {
        const indexData = {
          a: -1,
          b: 1,
          c: -1
        }; // for beforeCursorQuery

        rawQuery = {};
        (0, _connection.prepareCursorQuery)(rawQuery, cursorData, indexKeys, indexData, '$lt', '$gt');
        expect(rawQuery).toEqual({
          $or: [{
            a: 10,
            b: 100,
            c: {
              $gt: 1000
            }
          }, {
            a: 10,
            b: {
              $lt: 100
            }
          }, {
            a: {
              $gt: 10
            }
          }]
        }); // for afterCursorQuery

        rawQuery = {};
        (0, _connection.prepareCursorQuery)(rawQuery, cursorData, indexKeys, indexData, '$gt', '$lt');
        expect(rawQuery).toEqual({
          $or: [{
            a: 10,
            b: 100,
            c: {
              $lt: 1000
            }
          }, {
            a: 10,
            b: {
              $gt: 100
            }
          }, {
            a: {
              $lt: 10
            }
          }]
        });
      });
    });
  });
  describe('connection() -> ', () => {
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
      const resolver = (0, _connection.default)(_userModel.UserModel, UserTC);
      expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
    });
    it('Resolver object should have `filter` arg', () => {
      const resolver = (0, _connection.default)(_userModel.UserModel, UserTC);
      if (!resolver) throw new Error('Connection resolveris undefined');
      expect(resolver.hasArg('filter')).toBe(true);
    });
    it('Resolver object should have `sort` arg', () => {
      const resolver = (0, _connection.default)(_userModel.UserModel, UserTC);
      if (!resolver) throw new Error('Connection resolveris undefined');
      expect(resolver.hasArg('sort')).toBe(true);
    });
    it('Resolver object should have `connection args', () => {
      const resolver = (0, _connection.default)(_userModel.UserModel, UserTC);
      if (!resolver) throw new Error('Connection resolveris undefined');
      expect(resolver.hasArg('first')).toBe(true);
      expect(resolver.hasArg('last')).toBe(true);
      expect(resolver.hasArg('before')).toBe(true);
      expect(resolver.hasArg('after')).toBe(true);
    });
    describe('Resolver.resolve():Promise', () => {
      it('should be fulfilled Promise',
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        const resolver = (0, _connection.default)(_userModel.UserModel, UserTC);
        if (!resolver) throw new Error('Connection resolveris undefined');
        const result = resolver.resolve({
          args: {
            first: 20
          }
        });
        yield expect(result).resolves.toBeDefined();
      }));
      it('should return array of documents in `edges`',
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        const resolver = (0, _connection.default)(_userModel.UserModel, UserTC);
        if (!resolver) throw new Error('Connection resolveris undefined');
        const result = yield resolver.resolve({
          args: {
            first: 20
          }
        });
        expect(result.edges).toBeInstanceOf(Array);
        expect(result.edges).toHaveLength(2);
        expect(result.edges.map(d => d.node.name)).toEqual(expect.arrayContaining([user1.name, user2.name]));
      }));
      it('should limit records',
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        const resolver = (0, _connection.default)(_userModel.UserModel, UserTC);
        if (!resolver) throw new Error('Connection resolveris undefined');
        const result = yield resolver.resolve({
          args: {
            first: 1
          }
        });
        expect(result.edges).toBeInstanceOf(Array);
        expect(result.edges).toHaveLength(1);
      }));
      it('should sort records',
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        const resolver = (0, _connection.default)(_userModel.UserModel, UserTC);
        if (!resolver) throw new Error('Connection resolveris undefined');
        const result1 = yield resolver.resolve({
          args: {
            sort: {
              _id: 1
            },
            first: 1
          }
        });
        const result2 = yield resolver.resolve({
          args: {
            sort: {
              _id: -1
            },
            first: 1
          }
        });
        expect(`${result1.edges[0].node._id}`).not.toBe(`${result2.edges[0].node._id}`);
      }));
      it('should return mongoose documents',
      /*#__PURE__*/
      _asyncToGenerator(function* () {
        const resolver = (0, _connection.default)(_userModel.UserModel, UserTC);
        if (!resolver) throw new Error('Connection resolveris undefined');
        const result = yield resolver.resolve({
          args: {
            first: 20
          }
        });
        expect(result.edges[0].node).toBeInstanceOf(_userModel.UserModel);
        expect(result.edges[1].node).toBeInstanceOf(_userModel.UserModel);
      }));
    });
  });
});