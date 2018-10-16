"use strict";

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../../__mocks__/userModel");

var _updateById = _interopRequireDefault(require("../updateById"));

var _mongoid = _interopRequireDefault(require("../../types/mongoid"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('updateById() ->', () => {
  let UserTC;
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();

    UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
    UserTC.setRecordIdFn(source => source ? `${source._id}` : '');
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
      relocation: true
    });
    yield Promise.all([user1.save(), user2.save()]);
  }));
  it('should return Resolver object', () => {
    const resolver = (0, _updateById.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have `record` arg', () => {
      const resolver = (0, _updateById.default)(_userModel.UserModel, UserTC);
      const argConfig = resolver.getArgConfig('record');
      expect(argConfig.type).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(argConfig.type.ofType.name).toBe('UpdateByIdUserInput');
    });
    it('should have `record._id` required arg', () => {
      const resolver = (0, _updateById.default)(_userModel.UserModel, UserTC);
      const argConfig = resolver.getArgConfig('record') || {};
      expect(argConfig.type.ofType).toBeInstanceOf(_graphql.GraphQLInputObjectType);

      if (argConfig.type && argConfig.type.ofType) {
        const _idFieldType = new _graphqlCompose.InputTypeComposer(argConfig.type.ofType).getFieldType('_id');

        expect(_idFieldType).toBeInstanceOf(_graphql.GraphQLNonNull);
        expect((0, _graphql.getNullableType)(_idFieldType)).toBe(_mongoid.default);
      }
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be promise', () => {
      const result = (0, _updateById.default)(_userModel.UserModel, UserTC).resolve({});
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => 'catch error if appear, hide it from mocha');
    });
    it('should rejected with Error if args.record._id is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _updateById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {}
        }
      });
      yield expect(result).rejects.toMatchSnapshot();
    }));
    it('should return payload.recordId',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _updateById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            _id: user1.id,
            name: 'some name'
          }
        }
      });
      expect(result.recordId).toBe(user1.id);
    }));
    it('should change data via args.record in model',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _updateById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            _id: user1.id,
            name: 'newName'
          }
        }
      });
      expect(result.record.name).toBe('newName');
    }));
    it('should change data via args.record in database',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const checkedName = 'nameForMongoDB';
      yield (0, _updateById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            _id: user1.id,
            name: checkedName
          }
        }
      });
      yield expect(_userModel.UserModel.findOne({
        _id: user1._id
      })).resolves.toEqual(expect.objectContaining({
        name: checkedName
      }));
    }));
    it('should return payload.record',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const checkedName = 'anyName123';
      const result = yield (0, _updateById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            _id: user1.id,
            name: checkedName
          }
        }
      });
      expect(result.record.id).toBe(user1.id);
      expect(result.record.name).toBe(checkedName);
    }));
    it('should pass empty projection to findById and got full document data',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _updateById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            _id: user1.id
          }
        },
        projection: {
          record: {
            name: true
          }
        }
      });
      expect(result.record.id).toBe(user1.id);
      expect(result.record.name).toBe(user1.name);
      expect(result.record.gender).toBe(user1.gender);
    }));
    it('should return mongoose document',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _updateById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            _id: user1.id
          }
        }
      });
      expect(result.record).toBeInstanceOf(_userModel.UserModel);
    }));
    it('should call `beforeRecordMutate` method with founded `record` and `resolveParams` as args',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      let beforeMutationId;
      const result = yield (0, _updateById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            _id: user1.id
          }
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
      expect(beforeMutationId).toBe(user1.id);
    }));
    it('`beforeRecordMutate` may reject operation',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _updateById.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          record: {
            _id: user1.id,
            name: 'new name'
          }
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
        _id: user1._id
      });
      expect(exist.name).toBe(user1.name);
    }));
  });
  describe('Resolver.getType()', () => {
    it('should have correct output type name', () => {
      const outputType = (0, _updateById.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType.name).toBe(`UpdateById${UserTC.getTypeName()}Payload`);
    });
    it('should have recordId field', () => {
      const outputType = (0, _updateById.default)(_userModel.UserModel, UserTC).getType();
      const typeComposer = new _graphqlCompose.TypeComposer(outputType);
      expect(typeComposer.hasField('recordId')).toBe(true);
      expect(typeComposer.getFieldType('recordId')).toBe(_mongoid.default);
    });
    it('should have record field', () => {
      const outputType = (0, _updateById.default)(_userModel.UserModel, UserTC).getType();
      const typeComposer = new _graphqlCompose.TypeComposer(outputType);
      expect(typeComposer.hasField('record')).toBe(true);
      expect(typeComposer.getFieldType('record')).toBe(UserTC.getType());
    });
    it('should reuse existed outputType', () => {
      const outputTypeName = `UpdateById${UserTC.getTypeName()}Payload`;

      const existedType = _graphqlCompose.TypeComposer.create(outputTypeName);

      _graphqlCompose.schemaComposer.set(outputTypeName, existedType);

      const outputType = (0, _updateById.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType).toBe(existedType.getType());
    });
  });
});