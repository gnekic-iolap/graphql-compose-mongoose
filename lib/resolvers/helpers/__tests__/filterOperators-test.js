"use strict";

var _graphqlCompose = require("graphql-compose");

var _filterOperators = require("../filterOperators");

var _userModel = require("../../../__mocks__/userModel");

let itc;
beforeEach(() => {
  _graphqlCompose.schemaComposer.clear();

  itc = _graphqlCompose.InputTypeComposer.create({
    name: 'UserFilterInput',
    fields: {
      _id: 'String',
      employment: 'String',
      name: 'String',
      age: 'Int',
      skills: ['String']
    }
  });
});
describe('Resolver helper `filter` ->', () => {
  describe('_createOperatorsField()', () => {
    it('should add OPERATORS_FIELDNAME to filterType', () => {
      (0, _filterOperators._createOperatorsField)(itc, 'OperatorsTypeName', _userModel.UserModel, {});
      expect(itc.hasField(_filterOperators.OPERATORS_FIELDNAME)).toBe(true);
      expect(itc.getFieldTC(_filterOperators.OPERATORS_FIELDNAME).getTypeName()).toBe('OperatorsTypeName');
    });
    it('should by default have only indexed fields', () => {
      (0, _filterOperators._createOperatorsField)(itc, 'OperatorsTypeName', _userModel.UserModel, {});
      const operatorsTC = itc.getFieldTC(_filterOperators.OPERATORS_FIELDNAME);
      expect(operatorsTC.getFieldNames()).toEqual(expect.arrayContaining(['name', '_id', 'employment']));
      expect(operatorsTC.hasField('age')).toBe(false);
    });
    it('should have only provided fields via options', () => {
      (0, _filterOperators._createOperatorsField)(itc, 'OperatorsTypeName', _userModel.UserModel, {
        age: ['lt']
      });
      const operatorsTC = itc.getFieldTC(_filterOperators.OPERATORS_FIELDNAME);
      expect(operatorsTC.hasField('age')).toBe(true);
    });
    it('should have only provided operators via options for field', () => {
      (0, _filterOperators._createOperatorsField)(itc, 'OperatorsTypeName', _userModel.UserModel, {
        age: ['lt', 'gte']
      });
      const operatorsTC = itc.getFieldTC(_filterOperators.OPERATORS_FIELDNAME);
      const ageTC = operatorsTC.getFieldTC('age');
      expect(ageTC.getFieldNames()).toEqual(expect.arrayContaining(['lt', 'gte']));
    });
    it('should reuse existed operatorsType', () => {
      const existedITC = itc.constructor.schemaComposer.getOrCreateITC('ExistedType');
      (0, _filterOperators._createOperatorsField)(itc, 'ExistedType', _userModel.UserModel, {});
      expect(itc.getFieldType(_filterOperators.OPERATORS_FIELDNAME)).toBe(existedITC.getType());
    });
  });
  describe('addFilterOperators()', () => {
    it('should add OPERATORS_FIELDNAME via _createOperatorsField()', () => {
      (0, _filterOperators.addFilterOperators)(itc, _userModel.UserModel, {});
      expect(itc.hasField(_filterOperators.OPERATORS_FIELDNAME)).toBe(true);
      expect(itc.getFieldTC(_filterOperators.OPERATORS_FIELDNAME).getTypeName()).toBe('Operators');
    });
    it('should add OR field', () => {
      (0, _filterOperators.addFilterOperators)(itc, _userModel.UserModel, {});
      const fields = itc.getFieldNames();
      expect(fields).toEqual(expect.arrayContaining(['OR', 'name', 'age']));
      expect(itc.getFieldTC('OR').getType()).toBe(itc.getType());
    });
    it('should add AND field', () => {
      (0, _filterOperators.addFilterOperators)(itc, _userModel.UserModel, {});
      const fields = itc.getFieldNames();
      expect(fields).toEqual(expect.arrayContaining(['AND', 'name', 'age']));
      expect(itc.getFieldTC('AND').getType()).toBe(itc.getType());
    });
  });
  describe('processFilterOperators()', () => {
    it('should call query.find if args.filter.OPERATORS_FIELDNAME is provided', () => {
      const filter = {
        [_filterOperators.OPERATORS_FIELDNAME]: {
          age: {
            gt: 10,
            lt: 20
          }
        }
      };
      const spyWhereFn = jest.fn();
      const resolveParams = {
        query: {
          where: spyWhereFn
        }
      };
      (0, _filterOperators.processFilterOperators)(filter, resolveParams);
      expect(spyWhereFn).toBeCalledWith({
        age: {
          $gt: 10,
          $lt: 20
        }
      });
    });
    it('should convert OR query', () => {
      const filter = {
        OR: [{
          name: {
            first: 'Pavel'
          },
          age: 30
        }, {
          age: 40
        }]
      };
      const spyWhereFn = jest.fn();
      const resolveParams = {
        query: {
          where: spyWhereFn
        }
      };
      (0, _filterOperators.processFilterOperators)(filter, resolveParams);
      expect(spyWhereFn).toBeCalledWith({
        $or: [{
          age: 30,
          'name.first': 'Pavel'
        }, {
          age: 40
        }]
      });
    });
    it('should convert AND query', () => {
      const filter = {
        AND: [{
          name: {
            first: 'Pavel'
          }
        }, {
          age: 40
        }]
      };
      const spyWhereFn = jest.fn();
      const resolveParams = {
        query: {
          where: spyWhereFn
        }
      };
      (0, _filterOperators.processFilterOperators)(filter, resolveParams);
      expect(spyWhereFn).toBeCalledWith({
        $and: [{
          'name.first': 'Pavel'
        }, {
          age: 40
        }]
      });
    });
    it('should convert nested AND/OR query', () => {
      const filter = {
        OR: [{
          AND: [{
            name: {
              first: 'Pavel'
            }
          }, {
            OR: [{
              age: 30
            }, {
              age: 35
            }]
          }]
        }, {
          age: 40
        }]
      };
      const spyWhereFn = jest.fn();
      const resolveParams = {
        query: {
          where: spyWhereFn
        }
      };
      (0, _filterOperators.processFilterOperators)(filter, resolveParams);
      expect(spyWhereFn).toBeCalledWith({
        $or: [{
          $and: [{
            'name.first': 'Pavel'
          }, {
            $or: [{
              age: 30
            }, {
              age: 35
            }]
          }]
        }, {
          age: 40
        }]
      });
    });
  });
});