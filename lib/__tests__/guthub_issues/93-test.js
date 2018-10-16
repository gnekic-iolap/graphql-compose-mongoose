"use strict";

var _graphqlCompose = require("graphql-compose");

var _index = require("../../index");

var _userModel = require("../../__mocks__/userModel");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
beforeAll(() => _userModel.UserModel.base.connect());
afterAll(() => _userModel.UserModel.base.disconnect());
const UserTC = (0, _index.composeWithMongoose)(_userModel.UserModel);

_graphqlCompose.schemaComposer.rootQuery().addFields({
  users: UserTC.getResolver('findMany')
});

describe('issue #93', () => {
  it('$or, $and operator for filtering',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    _graphqlCompose.schemaComposer.rootQuery().addFields({
      users: UserTC.getResolver('findMany')
    });

    const schema = _graphqlCompose.schemaComposer.buildSchema();

    yield _userModel.UserModel.create({
      _id: '100000000000000000000301',
      name: 'User301',
      age: 301
    });
    yield _userModel.UserModel.create({
      _id: '100000000000000000000302',
      name: 'User302',
      age: 302,
      gender: 'male'
    });
    yield _userModel.UserModel.create({
      _id: '100000000000000000000303',
      name: 'User303',
      age: 302,
      gender: 'female'
    });
    const res = yield _graphqlCompose.graphql.graphql(schema, `
        {
          users(filter: { OR: [{ age: 301 }, { AND: [{ gender: male }, { age: 302 }] }] }) {
            name
          }
        }
      `);
    expect(res).toEqual({
      data: {
        users: [{
          name: 'User301'
        }, {
          name: 'User302'
        }]
      }
    });
  }));
});