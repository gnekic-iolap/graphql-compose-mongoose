"use strict";

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../../__mocks__/userModel");

var _removeById = _interopRequireDefault(require("../removeById"));

var _mongoid = _interopRequireDefault(require("../../types/mongoid"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('removeById() ->', () => {
  let UserTC;
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();

    UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
    UserTC.setRecordIdFn(source => source ? `${source._id}` : '');
  });
  let user;
  beforeEach(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    yield _userModel.UserModel.remove({});
    user = new _userModel.UserModel({
      name: 'userName1',
      skills: ['js', 'ruby', 'php', 'python'],
      gender: 'male',
      relocation: true
    });
    yield user.save();
  }));
  it('should return Resolver object', () => {
    const resolver = (0, _removeById.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have non-null `_id` arg', () => {
      const resolver = (0, _removeById.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('_id')).toBe(true);
      const argConfig = resolver.getArgConfig('_id');
      expect(argConfig.type).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(argConfig.type.ofType).toBe(_mongoid.default);
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be promise', () => {
      const result = (0, _removeById.default)(_userModel.UserModel, UserTC).resolve({});
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => 'catch error if appear, hide it from mocha');
    });
    it('should rejected with Error if args._id is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _removeById.default)(_userModel.UserModel, UserTC).resolve({
        args: {}
      });
      yield expect(result).rejects.toMatchSnapshot();
    }));
    it('should return payload.recordId',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _removeById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: user.id
        }
      });
      expect(result.recordId).toBe(user.id);
    }));
    it('should remove document in database',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      yield (0, _removeById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: user.id
        }
      });
      yield expect(_userModel.UserModel.findOne({
        _id: user._id
      })).resolves.toBeNull();
    }));
    it('should return payload.record',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _removeById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: user.id
        }
      });
      expect(result.record.id).toBe(user.id);
    }));
    it('should pass empty projection to findById and got full document data',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _removeById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: user.id
        },
        projection: {
          record: {
            name: true
          }
        }
      });
      expect(result.record.id).toBe(user.id);
      expect(result.record.name).toBe(user.name);
      expect(result.record.gender).toBe(user.gender);
    }));
    it('should return mongoose document',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _removeById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: user.id
        }
      });
      expect(result.record).toBeInstanceOf(_userModel.UserModel);
    }));
    it('should call `beforeRecordMutate` method with founded `record` and `resolveParams` as args',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      let beforeMutationId;
      const result = yield (0, _removeById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: user.id
        },
        context: {
          ip: '1.1.1.1'
        },
        beforeRecordMutate: (record, rp) => {
          beforeMutationId = record.id;
          record.someDynamic = rp.context.ip;
          return record;
        }
      });
      expect(result.record).toBeInstanceOf(_userModel.UserModel);
      expect(result.record.someDynamic).toBe('1.1.1.1');
      expect(beforeMutationId).toBe(user.id);
      const empty = yield _userModel.UserModel.collection.findOne({
        _id: user._id
      });
      expect(empty).toBe(null);
    }));
    it('`beforeRecordMutate` may reject operation',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _removeById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          _id: user.id
        },
        context: {
          readOnly: true
        },
        beforeRecordMutate: (record, rp) => {
          if (rp.context.readOnly) {
            return Promise.reject(new Error('Denied due context ReadOnly'));
          }

          return record;
        }
      });
      yield expect(result).rejects.toMatchSnapshot();
      const exist = yield _userModel.UserModel.collection.findOne({
        _id: user._id
      });
      expect(exist.name).toBe(user.name);
    }));
  });
  describe('Resolver.getType()', () => {
    it('should have correct output type name', () => {
      const outputType = (0, _removeById.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType.name).toBe(`RemoveById${UserTC.getTypeName()}Payload`);
    });
    it('should have recordId field', () => {
      const outputType = (0, _removeById.default)(_userModel.UserModel, UserTC).getType();
      const typeComposer = new _graphqlCompose.TypeComposer(outputType);
      expect(typeComposer.hasField('recordId')).toBe(true);
      expect(typeComposer.getFieldType('recordId')).toBe(_mongoid.default);
    });
    it('should have record field', () => {
      const outputType = (0, _removeById.default)(_userModel.UserModel, UserTC).getType();
      const typeComposer = new _graphqlCompose.TypeComposer(outputType);
      expect(typeComposer.hasField('record')).toBe(true);
      expect(typeComposer.getFieldType('record')).toBe(UserTC.getType());
    });
    it('should reuse existed outputType', () => {
      const outputTypeName = `RemoveById${UserTC.getTypeName()}Payload`;

      const existedType = _graphqlCompose.TypeComposer.create(outputTypeName);

      _graphqlCompose.schemaComposer.set(outputTypeName, existedType);

      const outputType = (0, _removeById.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType).toBe(existedType.getType());
    });
  });
});