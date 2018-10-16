"use strict";

var _graphqlCompose = require("graphql-compose");

var _characterModels = require("../discriminators/__mocks__/characterModels");

var _movieModel = require("../discriminators/__mocks__/movieModel");

var _composeWithMongooseDiscriminators = require("../composeWithMongooseDiscriminators");

var _discriminators = require("../discriminators");

beforeAll(() => _movieModel.MovieModel.base.connect());
afterAll(() => _movieModel.MovieModel.base.disconnect());

const _getCharacterModels = (0, _characterModels.getCharacterModels)('type'),
      CharacterModel = _getCharacterModels.CharacterModel,
      PersonModel = _getCharacterModels.PersonModel;

describe('composeWithMongooseDiscriminators ->', () => {
  beforeEach(() => {
    _graphqlCompose.schemaComposer.clear();
  });
  describe('basics', () => {
    it('should create and return a DiscriminatorTypeComposer', () => {
      expect((0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel)).toBeInstanceOf(_discriminators.DiscriminatorTypeComposer);
    });
    it('should return a TypeComposer as childTC on discriminator() call', () => {
      expect((0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel).discriminator(PersonModel)).toBeInstanceOf(_graphqlCompose.TypeComposer);
    });
  });
  describe('composeWithMongoose customisationOptions', () => {
    it('required input fields, should be passed down to resolvers', () => {
      const typeComposer = (0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel, {
        inputType: {
          fields: {
            required: ['kind']
          }
        }
      });
      const filterArgInFindOne = typeComposer.getResolver('findOne').getArg('filter');
      const inputComposer = new _graphqlCompose.InputTypeComposer(filterArgInFindOne.type);
      expect(inputComposer.isRequired('kind')).toBe(true);
    });
    it('should proceed customizationOptions.inputType.fields.required', () => {
      const itc = (0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel, {
        inputType: {
          fields: {
            required: ['name', 'friends']
          }
        }
      }).getInputTypeComposer();
      expect(itc.isRequired('name')).toBe(true);
      expect(itc.isRequired('friends')).toBe(true);
    });
    it('should be passed down record opts to resolvers', () => {
      const typeComposer = (0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel, {
        resolvers: {
          createOne: {
            record: {
              removeFields: ['friends'],
              requiredFields: ['name']
            }
          }
        }
      });
      const createOneRecordArgTC = typeComposer.getResolver('createOne').getArgTC('record');
      expect(createOneRecordArgTC.isRequired('name')).toBe(true);
      expect(createOneRecordArgTC.hasField('friends')).toBe(false);
    });
    it('should pass down records opts to createMany resolver', () => {
      const typeComposer = (0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel, {
        resolvers: {
          createMany: {
            records: {
              removeFields: ['friends'],
              requiredFields: ['name']
            }
          }
        }
      });
      const createManyRecordsArgTC = typeComposer.getResolver('createMany').getArgTC('records');
      expect(createManyRecordsArgTC.isRequired('name')).toBe(true);
      expect(createManyRecordsArgTC.hasField('friends')).toBe(false);
    });
  });
});