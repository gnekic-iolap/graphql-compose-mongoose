"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongodbMemoryServer = _interopRequireDefault(require("mongodb-memory-server"));

var _graphqlCompose = require("graphql-compose");

var _index = require("../../index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let mongoServer;
beforeAll(
/*#__PURE__*/
_asyncToGenerator(function* () {
  mongoServer = new _mongodbMemoryServer.default();
  const mongoUri = yield mongoServer.getConnectionString();
  yield _mongoose.default.connect(mongoUri, {
    useNewUrlParser: true
  });
}));
afterAll(() => {
  _mongoose.default.disconnect();

  mongoServer.stop();
}); // May require additional time for downloading MongoDB binaries

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
describe('issue #78 - Mongoose and Discriminators', () => {
  const options = {
    discriminatorKey: 'kind'
  };
  const eventSchema = new _mongoose.default.Schema({
    refId: String
  }, options);

  const Event = _mongoose.default.model('GenericEvent', eventSchema);

  const clickedLinkSchema = new _mongoose.default.Schema({
    url: String
  }, options);
  const ClickedLinkEvent = Event.discriminator('ClickedLinkEvent', clickedLinkSchema);
  const EventTC = (0, _index.composeWithMongoose)(Event);
  const ClickedLinkEventTC = (0, _index.composeWithMongoose)(ClickedLinkEvent);
  it('creating Types from models', () => {
    expect(EventTC.getFieldNames()).toEqual(['refId', '_id', 'kind']);
    expect(ClickedLinkEventTC.getFieldNames()).toEqual(['url', '_id', 'refId', 'kind']);
  });
  it('manually override resolver output type for findMany',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    const EventDescriminatorType = new _graphqlCompose.graphql.GraphQLUnionType({
      name: 'EventDescriminator',
      types: [EventTC.getType(), ClickedLinkEventTC.getType()],
      resolveType: value => {
        if (value.kind === 'ClickedLinkEvent') {
          return ClickedLinkEventTC.getType();
        }

        return EventTC.getType();
      }
    });
    EventTC.getResolver('findMany').setType(new _graphqlCompose.graphql.GraphQLList(EventDescriminatorType)); // let's check graphql response

    yield Event.create({
      refId: 'aaa'
    });
    yield Event.create({
      refId: 'bbb'
    });
    yield ClickedLinkEvent.create({
      refId: 'ccc',
      url: 'url1'
    });
    yield ClickedLinkEvent.create({
      refId: 'ddd',
      url: 'url2'
    });

    _graphqlCompose.schemaComposer.rootQuery().addFields({
      eventFindMany: EventTC.getResolver('findMany')
    });

    const schema = _graphqlCompose.schemaComposer.buildSchema();

    const res = yield _graphqlCompose.graphql.graphql(schema, `{
    eventFindMany {
        __typename
        ... on GenericEvent {
        refId
        }
        ... on ClickedLinkEvent {
        refId
        url
        }
    }
    }`);
    expect(res).toEqual({
      data: {
        eventFindMany: [{
          __typename: 'GenericEvent',
          refId: 'aaa'
        }, {
          __typename: 'GenericEvent',
          refId: 'bbb'
        }, {
          __typename: 'ClickedLinkEvent',
          refId: 'ccc',
          url: 'url1'
        }, {
          __typename: 'ClickedLinkEvent',
          refId: 'ddd',
          url: 'url2'
        }]
      }
    });
  }));
});