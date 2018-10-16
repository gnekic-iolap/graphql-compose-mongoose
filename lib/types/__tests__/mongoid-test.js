"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

var _graphql = require("graphql-compose/lib/graphql");

var _mongoid = _interopRequireDefault(require("../mongoid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const ObjectId = _mongoose.default.Types.ObjectId;
describe('GraphQLMongoID', () => {
  describe('serialize', () => {
    it('pass ObjectId', () => {
      const id = new ObjectId('5a0d77aa7e65a808ad24937f');
      expect(_mongoid.default.serialize(id)).toBe('5a0d77aa7e65a808ad24937f');
    });
    it('pass String', () => {
      const id = '5a0d77aa7e65a808ad249000';
      expect(_mongoid.default.serialize(id)).toBe('5a0d77aa7e65a808ad249000');
    });
  });
  describe('parseValue', () => {
    it('pass ObjectId', () => {
      const id = new ObjectId('5a0d77aa7e65a808ad24937f');
      expect(_mongoid.default.parseValue(id)).toBe(id);
    });
    it('pass ObjectId as string', () => {
      const id = '5a0d77aa7e65a808ad249000';
      expect(_mongoid.default.parseValue(id)).toEqual(id);
    });
    it('pass integer', () => {
      const id = 123;
      expect(_mongoid.default.parseValue(id)).toEqual(id);
    });
    it('pass any custom string', () => {
      const id = 'custom_id';
      expect(_mongoid.default.parseValue(id)).toEqual(id);
    });
  });
  describe('parseLiteral', () => {
    it('parse a ast STRING literal',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const ast = {
        kind: _graphql.Kind.STRING,
        value: '5a0d77aa7e65a808ad249000'
      };

      const id = _mongoid.default.parseLiteral(ast);

      expect(id).toEqual('5a0d77aa7e65a808ad249000');
    }));
    it('parse a ast INT literal',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const ast = {
        kind: _graphql.Kind.INT,
        value: 123
      };

      const id = _mongoid.default.parseLiteral(ast);

      expect(id).toEqual(123);
    }));
  });
});