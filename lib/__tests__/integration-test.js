"use strict";

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../__mocks__/userModel");

var _index = require("../index");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('integration tests', () => {
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();
  });
  describe('check subdocuments', () => {
    it('should return null if subdocument is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const UserTC = (0, _index.composeWithMongoose)(_userModel.UserModel);

      _graphqlCompose.schemaComposer.rootQuery().addFields({
        user: UserTC.getResolver('findById')
      });

      const schema = _graphqlCompose.schemaComposer.buildSchema();

      const user = new _userModel.UserModel({
        name: 'Test empty subDoc'
      });
      yield user.save();
      const result = yield (0, _graphql.graphql)(schema, `{
        user(_id: "${user._id}") {
          name
          subDoc {
            field1
            field2 {
              field21
            }
          }
        }
      }`);
      expect(result.data.user).toEqual({
        name: 'Test empty subDoc',
        subDoc: null
      });
    }));
    it('should return subdocument if it is non-empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const UserTC = (0, _index.composeWithMongoose)(_userModel.UserModel); // UserTC.get('$findById.subDoc').extendField('field2', {
      //   resolve: (source) => {
      //     console.log('$findById.subDoc.field2 source:', source)
      //     return source.field2;
      //   }
      // })

      _graphqlCompose.schemaComposer.rootQuery().addFields({
        user: UserTC.getResolver('findById')
      });

      const schema = _graphqlCompose.schemaComposer.buildSchema();

      const user2 = new _userModel.UserModel({
        name: 'Test non empty subDoc',
        subDoc: {
          field2: {
            field21: 'ok'
          }
        }
      });
      yield user2.save();
      const result2 = yield (0, _graphql.graphql)(schema, `{
        user(_id: "${user2._id}") {
          name
          subDoc {
            field1
            field2 {
              field21
            }
          }
        }
      }`);
      expect(result2.data.user).toEqual({
        name: 'Test non empty subDoc',
        subDoc: {
          field1: null,
          field2: {
            field21: 'ok'
          }
        }
      });
    }));
  });
  describe('check mixed field', () => {
    it('should properly return data via graphql query',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const UserTC = (0, _index.composeWithMongoose)(_userModel.UserModel, {
        schemaComposer: _graphqlCompose.schemaComposer
      });
      const user = new _userModel.UserModel({
        name: 'nodkz',
        someDynamic: {
          a: 123,
          b: [1, 2, true, false, 'ok'],
          c: {
            c: 1
          },
          d: null,
          e: 'str',
          f: true,
          g: false
        }
      });
      yield user.save();

      _graphqlCompose.schemaComposer.rootQuery().addFields({
        user: UserTC.getResolver('findById')
      });

      const schema = _graphqlCompose.schemaComposer.buildSchema();

      const query = `{
        user(_id: "${user._id}") {
          name
          someDynamic
        }
      }`;
      const result = yield (0, _graphql.graphql)(schema, query);
      expect(result.data.user.name).toBe(user.name);
      expect(result.data.user.someDynamic).toEqual(user.someDynamic);
    }));
  });
  describe('projection', () => {
    let schema;
    let UserTC;
    beforeAll(
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      UserTC = (0, _index.composeWithMongoose)(_userModel.UserModel);
      UserTC.addFields({
        rawData: {
          type: 'JSON',
          resolve: source => source.toJSON(),
          projection: {
            '*': true
          }
        }
      });

      _graphqlCompose.schemaComposer.rootQuery().addFields({
        user: UserTC.getResolver('findById')
      });

      schema = _graphqlCompose.schemaComposer.buildSchema();
      yield _userModel.UserModel.create({
        _id: '100000000000000000000000',
        name: 'Name',
        age: 20,
        gender: 'male',
        skills: ['a', 'b', 'c'],
        relocation: true
      });
    }));
    it('should request only fields from query',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const res = yield (0, _graphql.graphql)(schema, '{ user(_id: "100000000000000000000000") { name } }');
      expect(res).toMatchSnapshot('projection from query fields');
    }));
    it('should request all fields to rawData field',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const res = yield (0, _graphql.graphql)(schema, '{ user(_id: "100000000000000000000000") { rawData } }');
      expect(Object.keys(res.data.user.rawData)).toMatchSnapshot('projection from all fields');
    }));
  });
});