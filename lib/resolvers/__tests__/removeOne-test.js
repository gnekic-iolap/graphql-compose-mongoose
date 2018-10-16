"use strict";

var _graphqlCompose = require("graphql-compose");

var _userModel = require("../../__mocks__/userModel");

var _removeOne = _interopRequireDefault(require("../removeOne"));

var _mongoid = _interopRequireDefault(require("../../types/mongoid"));

var _fieldsConverter = require("../../fieldsConverter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('removeOne() ->', () => {
  let UserTC;
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();

    UserTC = (0, _fieldsConverter.convertModelToGraphQL)(_userModel.UserModel, 'User', _graphqlCompose.schemaComposer);
    UserTC.setRecordIdFn(source => source ? `${source._id}` : '');
  });
  let user1;
  let user2;
  let user3;
  beforeEach(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    yield _userModel.UserModel.remove({});
    user1 = new _userModel.UserModel({
      name: 'userName1',
      gender: 'male',
      relocation: true,
      age: 28
    });
    user2 = new _userModel.UserModel({
      name: 'userName2',
      gender: 'female',
      relocation: true,
      age: 29
    });
    user3 = new _userModel.UserModel({
      name: 'userName3',
      gender: 'female',
      relocation: true,
      age: 30
    });
    yield Promise.all([user1.save(), user2.save(), user3.save()]);
  }));
  it('should return Resolver object', () => {
    const resolver = (0, _removeOne.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have `filter` arg', () => {
      const resolver = (0, _removeOne.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('filter')).toBe(true);
    });
    it('should not have `skip` arg due mongoose error: ' + 'skip cannot be used with findOneAndRemove', () => {
      const resolver = (0, _removeOne.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('skip')).toBe(false);
    });
    it('should have `sort` arg', () => {
      const resolver = (0, _removeOne.default)(_userModel.UserModel, UserTC);
      expect(resolver.hasArg('sort')).toBe(true);
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be promise', () => {
      const result = (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({});
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => 'catch error if appears, hide it from mocha');
    });
    it('should return payload.recordId if record existed in db',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            _id: user1.id
          }
        }
      });
      expect(result.recordId).toBe(user1.id);
    }));
    it('should remove document in database',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const checkedName = 'nameForMongoDB';
      yield (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            _id: user1.id
          },
          input: {
            name: checkedName
          }
        }
      });
      yield expect(_userModel.UserModel.findOne({
        _id: user1._id
      })).resolves.toBeNull();
    }));
    it('should return payload.record',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            _id: user1.id
          }
        }
      });
      expect(result.record.id).toBe(user1.id);
    }));
    it('should sort records',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result1 = yield (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            relocation: true
          },
          sort: {
            age: 1
          }
        }
      });
      expect(result1.record.age).toBe(user1.age);
      const result2 = yield (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            relocation: true
          },
          sort: {
            age: -1
          }
        }
      });
      expect(result2.record.age).toBe(user3.age);
    }));
    it('should pass empty projection to findOne and got full document data',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
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
      const result = yield (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            _id: user1.id
          }
        }
      });
      expect(result.record).toBeInstanceOf(_userModel.UserModel);
    }));
    it('should rejected with Error if args.filter is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {}
      });
      yield expect(result).rejects.toMatchSnapshot();
    }));
    it('should call `beforeRecordMutate` method with founded `record` and `resolveParams` as args',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      let beforeMutationId;
      const result = yield (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
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
      const empty = yield _userModel.UserModel.collection.findOne({
        _id: user1._id
      });
      expect(empty).toBe(null);
    }));
    it('`beforeRecordMutate` may reject operation',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _removeOne.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          filter: {
            _id: user1.id
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
      const outputType = (0, _removeOne.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType.name).toBe(`RemoveOne${UserTC.getTypeName()}Payload`);
    });
    it('should have recordId field', () => {
      const outputType = (0, _removeOne.default)(_userModel.UserModel, UserTC).getType();
      const recordIdField = new _graphqlCompose.TypeComposer(outputType).getFieldConfig('recordId');
      expect(recordIdField.type).toBe(_mongoid.default);
    });
    it('should have record field', () => {
      const outputType = (0, _removeOne.default)(_userModel.UserModel, UserTC).getType();
      const recordField = new _graphqlCompose.TypeComposer(outputType).getFieldConfig('record');
      expect(recordField.type).toBe(UserTC.getType());
    });
    it('should reuse existed outputType', () => {
      const outputTypeName = `RemoveOne${UserTC.getTypeName()}Payload`;

      const existedType = _graphqlCompose.TypeComposer.create(outputTypeName);

      _graphqlCompose.schemaComposer.set(outputTypeName, existedType);

      const outputType = (0, _removeOne.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType).toBe(existedType.getType());
    });
  });
});