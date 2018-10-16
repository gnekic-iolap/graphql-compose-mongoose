"use strict";

var _graphqlCompose = require("graphql-compose");

var _composeWithMongooseDiscriminators = require("../../composeWithMongooseDiscriminators");

var _characterModels = require("../__mocks__/characterModels");

const _getCharacterModels = (0, _characterModels.getCharacterModels)('type'),
      CharacterModel = _getCharacterModels.CharacterModel;

const CharacterDTC = (0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel);
const DKeyFieldName = CharacterDTC.getDKey();
const DKeyETC = CharacterDTC.getDKeyETC();
const DInterfaceTC = CharacterDTC.getDInterface();
describe('prepareBaseResolvers()', () => {
  describe('setDKeyEnumOnITCArgs()', () => {
    const resolversWithFilterArgs = [];
    const resolversWithRecordArgs = [];
    const resolversWithRecordsArgs = [];
    const interestArgs = ['filter', 'record', 'records'];
    beforeAll(() => {
      const resolvers = CharacterDTC.getResolvers(); // map

      resolvers.forEach(resolver => {
        const argNames = resolver.getArgNames();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = argNames[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            const argName = _step.value;

            if (argName === interestArgs[0]) {
              resolversWithFilterArgs.push(resolver);
            }

            if (argName === interestArgs[1]) {
              resolversWithRecordArgs.push(resolver);
            }

            if (argName === interestArgs[2]) {
              resolversWithRecordsArgs.push(resolver);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
    });
    it('should set DKey field type to DKeyETC on filter args', () => {
      for (var _i = 0; _i < resolversWithFilterArgs.length; _i++) {
        const resolver = resolversWithFilterArgs[_i];
        expect(interestArgs[0]).toEqual('filter');
        expect(resolver.getArgTC(interestArgs[0]).getFieldConfig(DKeyFieldName).type).toEqual(CharacterDTC.getDKeyETC().getType());
      }
    });
    it('should set DKey field type to DKeyETC on record args', () => {
      for (var _i2 = 0; _i2 < resolversWithRecordArgs.length; _i2++) {
        const resolver = resolversWithRecordArgs[_i2];
        expect(interestArgs[1]).toEqual('record');

        if (resolver.name === 'createOne') {
          expect(resolver.getArgTC(interestArgs[1]).getFieldConfig(DKeyFieldName).type).toEqual(_graphqlCompose.graphql.GraphQLNonNull(DKeyETC.getType()));
        } else {
          expect(resolver.getArgTC(interestArgs[1]).getFieldConfig(DKeyFieldName).type).toEqual(DKeyETC.getType());
        }
      }
    });
    it('should set DKey field type to DKeyETC on records args', () => {
      for (var _i3 = 0; _i3 < resolversWithRecordsArgs.length; _i3++) {
        const resolver = resolversWithRecordsArgs[_i3];
        expect(interestArgs[2]).toEqual('records');
        expect(resolver.getArgTC(interestArgs[2]).getFieldConfig(DKeyFieldName).type).toEqual(_graphqlCompose.graphql.GraphQLNonNull(DKeyETC.getType()));
      }
    });
  });
  describe('createOne: Resolver', () => {
    const resolver = CharacterDTC.getResolver('createOne');
    it('should set resolver record field type to DInterface', () => {
      expect(resolver.getTypeComposer().getFieldType('record')).toEqual(DInterfaceTC.getType());
    });
  });
  describe('createMany: Resolver', () => {
    const resolver = CharacterDTC.getResolver('createMany');
    it('should set resolver records field type to NonNull Plural DInterface', () => {
      expect(resolver.getTypeComposer().getFieldType('records')).toEqual(new _graphqlCompose.graphql.GraphQLNonNull(_graphqlCompose.graphql.GraphQLList(DInterfaceTC.getType())));
    });
  });
  describe('findById: Resolver', () => {
    const resolver = CharacterDTC.getResolver('findByIds');
    it('should set resolver type to DInterface List', () => {
      expect(resolver.getType()).toEqual(_graphqlCompose.graphql.GraphQLList(CharacterDTC.getDInterface().getType()));
    });
  });
  describe('findMany: Resolver', () => {
    it('should set resolver type to DInterface List', () => {
      expect(CharacterDTC.getResolver('findMany').getType()).toEqual(_graphqlCompose.graphql.GraphQLList(DInterfaceTC.getType()));
    });
  });
  it('should set resolver type to DInterface, findOne', () => {
    expect(CharacterDTC.getResolver('findOne').getType()).toEqual(CharacterDTC.getDInterface().getType());
  });
  it('should set resolver type to DInterface, findById', () => {
    expect(CharacterDTC.getResolver('findById').getType()).toEqual(CharacterDTC.getDInterface().getType());
  });
  it('should set resolver record field type to DInterface, updateOne', () => {
    expect(CharacterDTC.getResolver('updateOne').getTypeComposer().getFieldType('record')).toEqual(CharacterDTC.getDInterface().getType());
  });
  it('should set resolver record field type to DInterface, updateById', () => {
    expect(CharacterDTC.getResolver('updateById').getTypeComposer().getFieldType('record')).toEqual(CharacterDTC.getDInterface().getType());
  });
  it('should set resolver record field type to DInterface, ', () => {
    expect(CharacterDTC.getResolver('removeById').getTypeComposer().getFieldType('record')).toEqual(CharacterDTC.getDInterface().getType());
  });
  it('should set DKey field type to NonNull(DKeyETC) on record arg, createOne', () => {
    expect(CharacterDTC.getResolver('createOne').getArgTC('record').getFieldType(CharacterDTC.getDKey())).toEqual(_graphqlCompose.graphql.GraphQLNonNull(CharacterDTC.getDKeyETC().getType()));
  });
  it('should set type on items in pagination resolver to DInterface List, pagination', () => {
    expect(CharacterDTC.getResolver('pagination').getTypeComposer().getFieldType('items')).toEqual(_graphqlCompose.graphql.GraphQLList(CharacterDTC.getDInterface().getType()));
  });
  it('should clone, rename edges field on connection resolver, connection', () => {
    const newName = `${CharacterDTC.getTypeName()}Edge`;
    const connectionRS = CharacterDTC.getResolver('connection');
    expect(connectionRS.getTypeComposer().getFieldTC('edges').getTypeName()).toEqual(newName);
  });
});