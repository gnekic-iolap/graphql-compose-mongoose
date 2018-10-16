"use strict";

var _mongoose = require("mongoose");

var _toMongoDottedObject = _interopRequireDefault(require("../toMongoDottedObject"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('toMongoDottedObject()', () => {
  it('should dot nested objects', () => {
    expect((0, _toMongoDottedObject.default)({
      a: {
        b: {
          c: 1
        }
      }
    })).toEqual({
      'a.b.c': 1
    });
  });
  it('should not dot query operators started with $', () => {
    expect((0, _toMongoDottedObject.default)({
      a: {
        $in: [1, 2, 3]
      }
    })).toEqual({
      a: {
        $in: [1, 2, 3]
      }
    });
    expect((0, _toMongoDottedObject.default)({
      a: {
        b: {
          $in: [1, 2, 3]
        }
      }
    })).toEqual({
      'a.b': {
        $in: [1, 2, 3]
      }
    });
    expect((0, _toMongoDottedObject.default)({
      $or: [{
        age: 1
      }, {
        age: 2
      }]
    })).toEqual({
      $or: [{
        age: 1
      }, {
        age: 2
      }]
    });
  });
  it('should mix query operators started with $', () => {
    expect((0, _toMongoDottedObject.default)({
      a: {
        $in: [1, 2, 3],
        $exists: true
      }
    })).toEqual({
      a: {
        $in: [1, 2, 3],
        $exists: true
      }
    });
  });
  it('should not mix query operators started with $ and regular fields', () => {
    expect((0, _toMongoDottedObject.default)({
      a: {
        $exists: true,
        b: 3
      }
    })).toEqual({
      a: {
        $exists: true
      },
      'a.b': 3
    });
  });
  it('should handle date object values as scalars', () => {
    expect((0, _toMongoDottedObject.default)({
      dateField: new Date(100)
    })).toEqual({
      dateField: new Date(100)
    });
  });
  it('should handle date object values when nested', () => {
    expect((0, _toMongoDottedObject.default)({
      a: {
        dateField: new Date(100)
      }
    })).toEqual({
      'a.dateField': new Date(100)
    });
  });
  it('should keep BSON ObjectId untouched', () => {
    const id = new _mongoose.Types.ObjectId();
    expect((0, _toMongoDottedObject.default)({
      a: {
        someField: id
      }
    })).toEqual({
      'a.someField': id
    });
  });
});