"use strict";

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _mongooseCommon = require("../../__mocks__/mongooseCommon");

var _userModel = require("../../__mocks__/userModel");

var _fieldsConverter = require("../../fieldsConverter");

var _mongoid = _interopRequireDefault(require("../../types/mongoid"));

var _createMany = _interopRequireDefault(require("../createMany"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('createMany() ->', () => {
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
    const resolver = (0, _createMany.default)(_userModel.UserModel, UserTC);
    expect(resolver).toBeInstanceOf(_graphqlCompose.Resolver);
  });
  describe('Resolver.args', () => {
    it('should have required `records` arg', () => {
      const resolver = (0, _createMany.default)(_userModel.UserModel, UserTC);
      const argConfig = resolver.getArgConfig('records');
      expect(argConfig.type).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(argConfig.type.toString()).toBe('[CreateManyUserInput!]!');
    });
    it('should have `records` arg as Plural', () => {
      const resolver = (0, _createMany.default)(_userModel.UserModel, UserTC);
      const argConfig = resolver.getArgConfig('records');
      expect(argConfig.type.ofType).toBeInstanceOf(_graphql.GraphQLList);
      expect(argConfig.type.ofType.toString()).toBe('[CreateManyUserInput!]');
    });
    it('should have `records` arg internal item as required', () => {
      const resolver = (0, _createMany.default)(_userModel.UserModel, UserTC);
      const argConfig = resolver.getArgConfig('records');
      expect(argConfig.type).toBeInstanceOf(_graphql.GraphQLNonNull);
      expect(argConfig.type.ofType.ofType.toString()).toBe('CreateManyUserInput!');
    });
  });
  describe('Resolver.resolve():Promise', () => {
    it('should be promise', () => {
      const result = (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({});
      expect(result).toBeInstanceOf(Promise);
      result.catch(() => 'catch error if appear, hide it from mocha');
    });
    it('should rejected with Error if args.records is empty',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {}
      });
      yield expect(result).rejects.toMatchSnapshot();
    }));
    it('should rejected with Error if args.records is not array',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          records: {}
        }
      });
      yield expect(result).rejects.toMatchSnapshot();
    }));
    it('should rejected with Error if args.records is empty array',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          records: []
        }
      });
      yield expect(result).rejects.toMatchSnapshot();
    }));
    it('should rejected with Error if args.records is array with empty items',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          records: [{
            name: 'fails'
          }, {}]
        }
      });
      yield expect(result).rejects.toMatchSnapshot();
    }));
    it('should return payload.recordIds',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          records: [{
            name: 'newName'
          }]
        }
      });
      expect(result.recordIds).toBeTruthy();
    }));
    it('should create documents with args.records and match createCount',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          records: [{
            name: 'newName0'
          }, {
            name: 'newName1'
          }]
        }
      });
      expect(result.createCount).toBe(2);
      expect(result.records[0].name).toBe('newName0');
      expect(result.records[1].name).toBe('newName1');
    }));
    it('should save documents to database',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const checkedName = 'nameForMongoDB';
      const res = yield (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          records: [{
            name: checkedName
          }, {
            name: checkedName
          }]
        }
      });
      const docs = yield _userModel.UserModel.collection.find({
        _id: {
          $in: res.recordIds
        }
      }).toArray();
      expect(docs.length).toBe(2);
      expect(docs[0].name).toBe(checkedName);
      expect(docs[1].name).toBe(checkedName);
    }));
    it('should return payload.records',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          records: [{
            name: 'NewUser'
          }]
        }
      });
      expect(result.records[0]._id).toBe(result.recordIds[0]);
    }));
    it('should return mongoose documents',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          records: [{
            name: 'NewUser'
          }]
        }
      });
      expect(result.records[0]).toBeInstanceOf(_userModel.UserModel);
    }));
    it('should call `beforeRecordMutate` method with each created `record` and `resolveParams` as args',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const result = yield (0, _createMany.default)(_userModel.UserModel, UserTC).resolve({
        args: {
          records: [{
            name: 'NewUser0'
          }, {
            name: 'NewUser1'
          }]
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
      expect(result.records[0]).toBeInstanceOf(_userModel.UserModel);
      expect(result.records[1]).toBeInstanceOf(_userModel.UserModel);
      expect(result.records[0].name).toBe('OverridedName');
      expect(result.records[1].name).toBe('OverridedName');
      expect(result.records[0].someDynamic).toBe('1.1.1.1');
      expect(result.records[1].someDynamic).toBe('1.1.1.1');
    }));
    it('should execute hooks on save',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      _graphqlCompose.schemaComposer.clear();

      const ClonedUserSchema = _userModel.UserModel.schema.clone();

      ClonedUserSchema.pre('save', function (next) {
        this.name = 'ChangedAgain';
        this.age = 18;
        return next();
      });

      const ClonedUserModel = _mongooseCommon.mongoose.model('UserClone', ClonedUserSchema);

      const ClonedUserTC = (0, _fieldsConverter.convertModelToGraphQL)(ClonedUserModel, 'UserClone', _graphqlCompose.schemaComposer);
      ClonedUserTC.setRecordIdFn(source => source ? `${source._id}` : '');
      const result = yield (0, _createMany.default)(ClonedUserModel, ClonedUserTC).resolve({
        args: {
          records: [{
            name: 'NewUser0'
          }, {
            name: 'NewUser1'
          }]
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
      expect(result.records[0]).toBeInstanceOf(ClonedUserModel);
      expect(result.records[1]).toBeInstanceOf(ClonedUserModel);
      expect(result.records[0].age).toBe(18);
      expect(result.records[1].age).toBe(18);
      expect(result.records[0].name).toBe('ChangedAgain');
      expect(result.records[1].name).toBe('ChangedAgain');
      expect(result.records[0].someDynamic).toBe('1.1.1.1');
      expect(result.records[1].someDynamic).toBe('1.1.1.1');
    }));
  });
  describe('Resolver.getType()', () => {
    it('should have correct output type name', () => {
      const outputType = (0, _createMany.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType.name).toBe(`CreateMany${UserTC.getTypeName()}Payload`);
    });
    it('should have recordIds field, NonNull List', () => {
      const outputType = (0, _createMany.default)(_userModel.UserModel, UserTC).getType();
      const recordIdField = new _graphqlCompose.TypeComposer(outputType).getFieldConfig('recordIds');
      expect(recordIdField.type).toEqual(new _graphql.GraphQLNonNull((0, _graphql.GraphQLList)(_mongoid.default)));
    });
    it('should have records field, NonNull List', () => {
      const outputType = (0, _createMany.default)(_userModel.UserModel, UserTC).getType();
      const recordField = new _graphqlCompose.TypeComposer(outputType).getFieldConfig('records');
      expect(recordField.type).toEqual(new _graphql.GraphQLNonNull((0, _graphql.GraphQLList)(UserTC.getType())));
    });
    it('should have createCount field, Int', () => {
      const outputType = (0, _createMany.default)(_userModel.UserModel, UserTC).getType();
      const recordField = new _graphqlCompose.TypeComposer(outputType).getFieldConfig('createCount');
      expect(recordField.type).toEqual(new _graphql.GraphQLNonNull(_graphql.GraphQLInt));
    });
    it('should reuse existed outputType', () => {
      const outputTypeName = `CreateMany${UserTC.getTypeName()}Payload`;

      const existedType = _graphqlCompose.TypeComposer.create(outputTypeName);

      _graphqlCompose.schemaComposer.set(outputTypeName, existedType);

      const outputType = (0, _createMany.default)(_userModel.UserModel, UserTC).getType();
      expect(outputType).toBe(existedType.getType());
    });
  });
});