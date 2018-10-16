"use strict";

var _graphqlCompose = require("graphql-compose");

var _characterModels = require("../__mocks__/characterModels");

var _composeWithMongooseDiscriminators = require("../../composeWithMongooseDiscriminators");

const _getCharacterModels = (0, _characterModels.getCharacterModels)('type'),
      CharacterModel = _getCharacterModels.CharacterModel,
      PersonModel = _getCharacterModels.PersonModel,
      DroidModel = _getCharacterModels.DroidModel;

beforeAll(() => _graphqlCompose.schemaComposer.clear());
describe('composeChildTC ->', () => {
  const CharacterDTC = (0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel);
  const PersonTC = CharacterDTC.discriminator(PersonModel);
  const DroidTC = CharacterDTC.discriminator(DroidModel);
  it('should set DInterface to childTC', () => {
    expect(DroidTC.hasInterface(CharacterDTC.getDInterface())).toBeTruthy();
    expect(PersonTC.hasInterface(CharacterDTC.getDInterface())).toBeTruthy();
  });
  it('should copy all baseFields from BaseDTC to ChildTCs', () => {
    expect(DroidTC.getFieldNames()).toEqual(expect.arrayContaining(CharacterDTC.getFieldNames()));
    expect(PersonTC.getFieldNames()).toEqual(expect.arrayContaining(CharacterDTC.getFieldNames()));
  });
  it('should make childTC have same fieldTypes as baseTC', () => {
    const characterFields = CharacterDTC.getFieldNames();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = characterFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        const field = _step.value;
        expect(DroidTC.getFieldType(field)).toEqual(CharacterDTC.getFieldType(field));
        expect(PersonTC.getFieldType(field)).toEqual(CharacterDTC.getFieldType(field));
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
  it('should operate normally like any other TypeComposer', () => {
    const fields = PersonTC.getFieldNames();
    PersonTC.addFields({
      field: {
        type: 'String'
      }
    });
    expect(PersonTC.getFieldNames()).toEqual(fields.concat(['field']));
    PersonTC.removeField('field');
    expect(PersonTC.getFieldNames()).toEqual(fields);
  });
});