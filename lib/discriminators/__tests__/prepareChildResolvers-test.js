"use strict";

var _graphqlCompose = require("graphql-compose");

var _composeWithMongooseDiscriminators = require("../../composeWithMongooseDiscriminators");

var _characterModels = require("../__mocks__/characterModels");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const DKeyFieldName = 'type';

const _getCharacterModels = (0, _characterModels.getCharacterModels)(DKeyFieldName),
      CharacterModel = _getCharacterModels.CharacterModel,
      PersonModel = _getCharacterModels.PersonModel;

beforeAll(() => CharacterModel.base.connect());
afterAll(() => CharacterModel.base.disconnect());
describe('prepareChildResolvers()', () => {
  describe('setQueryDKey()', () => {
    let PersonTC;
    beforeAll(() => {
      PersonTC = (0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel).discriminator(PersonModel);
    });
    beforeEach(
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      yield PersonModel.remove({});
    }));
    it('should set DKey on createOne',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const res = yield PersonTC.getResolver('createOne').resolve({
        args: {
          record: {
            name: 'Agent 007',
            dob: 124343
          }
        }
      });
      expect(res.record[DKeyFieldName]).toBe(PersonModel.modelName);
    }));
    it('should set DKey on createMany',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      const res = yield PersonTC.getResolver('createMany').resolve({
        args: {
          records: [{
            name: 'Agent 007',
            dob: 124343
          }, {
            name: 'Agent 007',
            dob: 124343
          }]
        }
      });
      expect(res.records[0][DKeyFieldName]).toBe(PersonModel.modelName);
      expect(res.records[1][DKeyFieldName]).toBe(PersonModel.modelName);
    }));
  });
  describe('hideDKey()', () => {
    const resolversWithFilterArgs = [];
    const resolversWithRecordArgs = [];
    const resolversWithRecordsArgs = [];
    const interestArgs = ['filter', 'record', 'records'];
    beforeAll(() => {
      const PersonTC = (0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel).discriminator(PersonModel);
      const resolvers = PersonTC.getResolvers();
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
    it('should hide DKey field on filter args', () => {
      for (var _i = 0; _i < resolversWithFilterArgs.length; _i++) {
        const resolver = resolversWithFilterArgs[_i];
        expect(interestArgs[0]).toEqual('filter');
        expect(resolver.getArgTC(interestArgs[0]).hasField(DKeyFieldName)).toBeFalsy();
      }
    });
    it('should hide DKey field on record args', () => {
      for (var _i2 = 0; _i2 < resolversWithRecordArgs.length; _i2++) {
        const resolver = resolversWithRecordArgs[_i2];
        expect(interestArgs[1]).toEqual('record');
        expect(resolver.getArgTC(interestArgs[1]).hasField(DKeyFieldName)).toBeFalsy();
      }
    });
    it('should hide DKey field on records args', () => {
      for (var _i3 = 0; _i3 < resolversWithRecordsArgs.length; _i3++) {
        const resolver = resolversWithRecordsArgs[_i3];
        expect(interestArgs[2]).toEqual('records');
        expect(resolver.getArgTC(interestArgs[2]).hasField(DKeyFieldName)).toBeFalsy();
      }
    });
  });
  describe('copyResolverArgTypes()', () => {
    afterAll(() => {
      _graphqlCompose.schemaComposer.clear();
    }); // Note childResolver Arg fields are copied from baseResolver

    const baseDTC = (0, _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators)(CharacterModel, {
      resolvers: {
        createOne: {
          requiredFields: ['kind']
        }
      }
    });
    const PersonTC = baseDTC.discriminator(PersonModel);
    it('should copy base common ResolverArgTypes to child', () => {
      expect(baseDTC.getResolver('createOne').getArgTC('record').getFieldType('kind')).toEqual(PersonTC.getResolver('createOne').getArgTC('record').getFieldType('kind'));
    });
  });
});