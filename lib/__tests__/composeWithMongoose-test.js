"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

var _graphqlCompose = require("graphql-compose");

var _graphql = require("graphql-compose/lib/graphql");

var _userModel = require("../__mocks__/userModel");

var _composeWithMongoose = require("../composeWithMongoose");

var _mongoid = _interopRequireDefault(require("../types/mongoid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-unused-expressions */
beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
describe('composeWithMongoose ->', () => {
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();
  });
  describe('MongooseModelToTypeComposer()', () => {
    describe('basics', () => {
      it('should return TypeComposer', () => {
        expect((0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel)).toBeInstanceOf(_graphqlCompose.TypeComposer);
        expect((0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          name: 'Ok'
        })).toBeInstanceOf(_graphqlCompose.TypeComposer);
      });
      it('should set type name from model or opts.name', () => {
        expect((0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel).getTypeName()).toBe(_userModel.UserModel.modelName);

        _graphqlCompose.schemaComposer.clear();

        expect((0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          name: 'Ok'
        }).getTypeName()).toBe('Ok');
      });
      it('should set description from opts.description', () => {
        const description = 'This is model from mongoose';
        expect((0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          description
        }).getDescription()).toBe(description);
      });
      it('should get fields from mongoose model', () => {
        const tc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel);
        expect(tc.getFieldNames()).toEqual(expect.arrayContaining(['_id', 'name', 'gender', 'age']));
      });
      it('should have NonNull _id field', () => {
        const tc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel);
        expect(tc.getFieldType('_id')).toBeInstanceOf(_graphql.GraphQLNonNull);
        expect(tc.getFieldType('_id').ofType).toBe(_mongoid.default);
      });
      it('composeWithMongoose should generate new TypeComposer (without cache)', () => {
        const tc1 = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel);

        _graphqlCompose.schemaComposer.clear();

        const tc2 = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel);
        expect(tc1).not.toBe(tc2);
      });
    });
    describe('filterFields()', () => {
      it('should proceed opts.fields.remove', () => {
        const tc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          fields: {
            remove: ['name', 'gender']
          }
        });
        expect(tc.getFieldNames()).not.toEqual(expect.arrayContaining(['name', 'gender']));
        expect(tc.getFieldNames()).toEqual(expect.arrayContaining(['_id', 'age']));
      });
      it('should proceed opts.fields.only', () => {
        const tc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          fields: {
            only: ['name', 'gender']
          }
        });
        expect(tc.getFieldNames()).toEqual(expect.arrayContaining(['name', 'gender']));
      });
    });
    describe('createInputType()', () => {
      it('should be availiable InputTypeComposer', () => {
        const itc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel).getInputTypeComposer();
        expect(itc).toBeInstanceOf(_graphqlCompose.InputTypeComposer);
      });
      it('should set type name opts.inputType.name', () => {
        const itc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          inputType: {
            name: 'GreatUserInput'
          }
        }).getInputTypeComposer();
        expect(itc.getTypeName()).toBe('GreatUserInput');
      });
      it('should set description from opts.inputType.name', () => {
        const itc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          inputType: {
            description: 'type for input data'
          }
        }).getInputTypeComposer();
        expect(itc.getDescription()).toBe('type for input data');
      });
      it('should proceed opts.inputType.fields.remove', () => {
        const itc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          inputType: {
            fields: {
              remove: ['name', 'gender']
            }
          }
        }).getInputTypeComposer();
        expect(itc.getFieldNames()).not.toEqual(expect.arrayContaining(['name', 'gender']));
        expect(itc.getFieldNames()).toEqual(expect.arrayContaining(['_id', 'age']));
      });
      it('should proceed opts.inputType.fields.only', () => {
        const itc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          inputType: {
            fields: {
              only: ['name', 'gender']
            }
          }
        }).getInputTypeComposer();
        expect(itc.getFieldNames()).toEqual(expect.arrayContaining(['name', 'gender']));
      });
      it('should proceed opts.inputType.fields.required', () => {
        const itc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          inputType: {
            fields: {
              required: ['name', 'gender']
            }
          }
        }).getInputTypeComposer();
        expect(itc.isRequired('name')).toBe(true);
        expect(itc.isRequired('gender')).toBe(true);
        expect(itc.isRequired('age')).toBe(false);
      });
    });
    describe('createResolvers()', () => {
      it('should not be called if opts.resolvers === false', () => {
        const tc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          resolvers: false
        });
        expect(Array.from(tc.getResolvers().keys())).toHaveLength(0);
      });
      it('should be called if opts.resolvers not exists or has value', () => {
        const tc = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel);
        expect(Array.from(tc.getResolvers().keys())).not.toHaveLength(0);
        const tc2 = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          resolvers: {}
        });
        expect(Array.from(tc2.getResolvers().keys())).not.toHaveLength(0);
      });
      it('should not provide resolver if opts.resolvers.[resolverName] === false', () => {
        const tc2 = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          resolvers: {
            removeById: false,
            findMany: {},
            updateOne: {
              some: 123
            }
          }
        });
        const resolverKeys = Array.from(tc2.getResolvers().keys());
        expect(resolverKeys).not.toContain('removeById');
        expect(resolverKeys).toEqual(expect.arrayContaining(['findMany', 'updateOne', 'updateMany']));
      });
    });
  });
  describe('3rd party resolvers', () => {
    describe('graphql-compose-connection', () => {
      it('should add `connection` resolver by default', () => {
        const tc2 = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel);
        expect(tc2.getResolver('connection')).toBeDefined();
      });
    });
    describe('graphql-compose-pagination', () => {
      it('should add `pagination` resolver by default', () => {
        const tc2 = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel);
        expect(tc2.getResolver('pagination')).toBeDefined();
      });
      it('should add `pagination` resolver with `perPage` option', () => {
        const tc2 = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
          resolvers: {
            pagination: {
              perPage: 333
            }
          }
        });
        const resolver = tc2.getResolver('pagination');
        expect(resolver).toBeDefined();
        expect(resolver.getArgConfig('perPage').defaultValue).toBe(333);
      });
    });
  });
  describe('complex situations', () => {
    it('required input fields, should be passed down to resolvers', () => {
      const typeComposer = (0, _composeWithMongoose.composeWithMongoose)(_userModel.UserModel, {
        inputType: {
          fields: {
            required: ['age']
          }
        }
      });
      const filterArgInFindOne = typeComposer.getResolver('findOne').getArg('filter');
      const inputConposer = new _graphqlCompose.InputTypeComposer(filterArgInFindOne.type);
      expect(inputConposer.isRequired('age')).toBe(true);
    });
    it('should use cached type to avoid maximum call stack size exceeded', () => {
      const PersonSchema = new _mongoose.default.Schema({
        name: String
      });
      PersonSchema.add({
        spouse: PersonSchema,
        friends: [PersonSchema]
      });

      const PersonModel = _mongoose.default.model('Person', PersonSchema);

      const tc = (0, _composeWithMongoose.composeWithMongoose)(PersonModel);
      expect(tc.getFieldNames()).toEqual(expect.arrayContaining(['_id', 'name', 'spouse', 'friends']));
    });
  });
});