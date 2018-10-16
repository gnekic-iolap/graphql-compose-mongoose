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

describe('issue #92 - How to verify the fields?', () => {
  UserTC.wrapResolverResolve('createOne', next => rp => {
    if (rp.args.record.age < 21) throw new Error('You are too young');
    if (rp.args.record.age > 60) throw new Error('You are too old');
    return next(rp);
  });

  _graphqlCompose.schemaComposer.rootMutation().addFields({
    addUser: UserTC.getResolver('createOne')
  });

  const schema = _graphqlCompose.schemaComposer.buildSchema();

  it('correct request',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    const result = yield _graphqlCompose.graphql.graphql(schema, `
          mutation {
            addUser(record: { name: "User1", age: 30 }) {
              record {
                name
                age
              }
            }
          }
        `);
    expect(result).toEqual({
      data: {
        addUser: {
          record: {
            age: 30,
            name: 'User1'
          }
        }
      }
    });
  }));
  it('wrong request',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    const result = yield _graphqlCompose.graphql.graphql(schema, `
          mutation {
            addUser(record: { name: "User1", age: 10 }) {
              record {
                name
                age
              }
            }
          }
        `);
    expect(result).toEqual({
      data: {
        addUser: null
      },
      errors: expect.anything()
    });
    expect(result.errors[0].message).toBe('You are too young');
  }));
});