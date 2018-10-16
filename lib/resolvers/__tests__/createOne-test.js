"use strict";

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../../__mocks__/userModel");

var _createOne = _interopRequireDefault(require("../createOne"));

var _fieldsConverter = require("../../fieldsConverter");

var _mongoid = _interopRequireDefault(require("../../types/mongoid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('createOne() ->', () => {
  let UserTC;
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();

    UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
    UserTC.setRecordIdFn(source => source ? `${source._id}` : '');
  });
  beforeEach(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    yield _userModel.UserModel.remove({});
  }));
  it('should return Resolver object', () => {
    const resolver = (0, _createOne.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have required `record` arg', () => {
      const resolver = (0, _createOne.default)(_userModel.UserModel, UserTC);
      const argConfig = resolver.getArgConfig('record');
      expect(argConfig.type).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(argConfig.type.ofType.name).toBe('CreateOneUserInput');
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be promise', () => {
      const result = (0, _createOne.default)(_userModel.UserModel, UserTC).resolve({});
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => 'catch error if appear, hide it from mocha');
    });
    it('should rejected with Error if args.record is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _createOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {}
      });
      yield expect(result).rejects.toMatchSnapshot();
    }));
    it('should return payload.recordId',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _createOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            name: 'newName'
          }
        }
      });
      expect(result.recordId).toBeTruthy();
    }));
    it('should create document with args.record',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _createOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            name: 'newName'
          }
        }
      });
      expect(result.record.name).toBe('newName');
    }));
    it('should save document to database',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const checkedName = 'nameForMongoDB';
      const res = yield (0, _createOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            name: checkedName
          }
        }
      });
      const doc = yield _userModel.UserModel.collection.findOne({
        _id: res.record._id
      });
      expect(doc.name).toBe(checkedName);
    }));
    it('should return payload.record',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _createOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            name: 'NewUser'
          }
        }
      });
      expect(result.record.id).toBe(result.recordId);
    }));
    it('should return mongoose document',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _createOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            name: 'NewUser'
          }
        }
      });
      expect(result.record).toBeInstanceOf(_userModel.UserModel);
    }));
    it('should call `beforeRecordMutate` method with created `record` and `resolveParams` as args',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _createOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            name: 'NewUser'
          }
        },
        context: {
          ip: '1.1.1.1'
        },
        beforeRecordMutate: (record, rp) => {
          record.name = 'OverridedName';
          record.someDynamic = rp.context.ip;
          return record;
        }
      });
      expect(result.record).toBeInstanceOf(_userModel.UserModel);
      expect(result.record.name).toBe('OverridedName');
      expect(result.record.someDynamic).toBe('1.1.1.1');
    }));
  });
  describe('Resolver.getType()', () => {
    it('should have correct output type name', () => {
      const outputType = (0, _createOne.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType.name).toBe(`CreateOne${UserTC.getTypeName()}Payload`);
    });
    it('should have recordId field', () => {
      const outputType = (0, _createOne.default)(_userModel.UserModel, UserTC).getType();
      const recordIdField = new _graphqlCompose.TypeComposer(outputType).getFieldConfig('recordId');
      expect(recordIdField.type).toBe(_mongoid.default);
    });
    it('should have record field', () => {
      const outputType = (0, _createOne.default)(_userModel.UserModel, UserTC).getType();
      const recordField = new _graphqlCompose.TypeComposer(outputType).getFieldConfig('record');
      expect(recordField.type).toBe(UserTC.getType());
    });
    it('should reuse existed outputType', () => {
      const outputTypeName = `CreateOne${UserTC.getTypeName()}Payload`;

      const existedType = _graphqlCompose.TypeComposer.create(outputTypeName);

      _graphqlCompose.schemaComposer.set(outputTypeName, existedType);

      const outputType = (0, _createOne.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType).toBe(existedType.getType());
    });
  });
});