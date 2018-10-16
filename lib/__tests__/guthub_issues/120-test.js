"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongodbMemoryServer = _interopRequireDefault(require("mongodb-memory-server"));

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
  }); // mongoose.set('debug', true);
}));
afterAll(() => {
  _mongoose.default.disconnect();

  mongoServer.stop();
}); // May require additional time for downloading MongoDB binaries

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
describe('issue #120 - check `connection` resolver with last/before', () => {
  const RecordSchema = new _mongoose.default.Schema({
    id: String,
    title: String
  });

  const Record = _mongoose.default.model('Record', RecordSchema);

  const RecordTC = (0, _index.composeWithMongoose)(Record);
  const resolver = RecordTC.getResolver('connection');
  beforeAll(
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    for (let i = 1; i <= 9; i++) {
      yield Record.create({
        _id: `10000000000000000000000${i}`,
        title: `${i}`
      });
    }
  }));
  it('check last/before with sorting',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    const res1 = yield resolver.resolve({
      args: {
        last: 2,
        before: '',
        sort: {
          _id: 1
        }
      }
    });
    expect(res1.edges.map(({
      cursor,
      node
    }) => ({
      cursor,
      node: node.toString()
    }))).toEqual([{
      cursor: 'eyJfaWQiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDgifQ==',
      node: '{ _id: 100000000000000000000008 }'
    }, {
      cursor: 'eyJfaWQiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDkifQ==',
      node: '{ _id: 100000000000000000000009 }'
    }]);
    const res2 = yield resolver.resolve({
      args: {
        last: 2,
        before: 'eyJfaWQiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDgifQ==',
        sort: {
          _id: 1
        }
      }
    });
    expect(res2.edges.map(({
      cursor,
      node
    }) => ({
      cursor,
      node: node.toString()
    }))).toEqual([{
      cursor: 'eyJfaWQiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDYifQ==',
      node: '{ _id: 100000000000000000000006 }'
    }, {
      cursor: 'eyJfaWQiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDcifQ==',
      node: '{ _id: 100000000000000000000007 }'
    }]);
  }));
  it('check last/before without sorting',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    const res1 = yield resolver.resolve({
      args: {
        last: 2,
        before: ''
      }
    });
    expect(res1.edges.map(({
      cursor,
      node
    }) => ({
      cursor,
      node: node.toString()
    }))).toEqual([{
      cursor: 'Nw==',
      node: "{ _id: 100000000000000000000008, title: '8', __v: 0 }"
    }, {
      cursor: 'OA==',
      node: "{ _id: 100000000000000000000009, title: '9', __v: 0 }"
    }]);
    const res2 = yield resolver.resolve({
      args: {
        last: 2,
        before: 'Nw=='
      }
    });
    expect(res2.edges.map(({
      cursor,
      node
    }) => ({
      cursor,
      node: node.toString()
    }))).toEqual([{
      cursor: 'NQ==',
      node: "{ _id: 100000000000000000000006, title: '6', __v: 0 }"
    }, {
      cursor: 'Ng==',
      node: "{ _id: 100000000000000000000007, title: '7', __v: 0 }"
    }]);
  }));
});