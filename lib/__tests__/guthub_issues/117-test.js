"use strict";

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongodbMemoryServer = _interopRequireDefault(require("mongodb-memory-server"));

var _index = require("../../index");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
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
});
describe('issue #117', () => {
  it('`populate()` method for arrays is broken',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    const PlayerSchema = new _mongoose.default.Schema({
      name: {
        type: String,
        required: true
      },
      surname: {
        type: String,
        required: true,
        default: []
      },
      sex: {
        type: String,
        required: true,
        enum: ['m', 'f']
      }
    });
    const GameSchema = new _mongoose.default.Schema({
      players: {
        required: true,
        type: [{
          type: _mongoose.default.Schema.Types.ObjectId,
          ref: 'PlayerModel'
        }]
      }
    });

    const GameModel = _mongoose.default.model('GameModel', GameSchema);

    const PlayerModel = _mongoose.default.model('PlayerModel', PlayerSchema);

    const player1 = yield PlayerModel.create({
      name: '1',
      surname: '1',
      sex: 'm'
    });
    const player2 = yield PlayerModel.create({
      name: '2',
      surname: '2',
      sex: 'f'
    });
    const game = yield GameModel.create({
      players: [player1, player2]
    });
    const id = game._id;
    const g1 = yield GameModel.findOne({
      _id: id
    }).populate('players');
    expect(g1.toJSON()).toEqual({
      __v: 0,
      _id: expect.anything(),
      players: [{
        __v: 0,
        _id: expect.anything(),
        name: '1',
        sex: 'm',
        surname: '1'
      }, {
        __v: 0,
        _id: expect.anything(),
        name: '2',
        sex: 'f',
        surname: '2'
      }]
    });
    (0, _index.composeWithMongoose)(GameModel);
    const g2 = yield GameModel.findOne({
      _id: id
    }).populate('players'); // WAS SUCH ERROR
    // expect(g2.toJSON()).toEqual({ __v: 0, _id: expect.anything(), players: [] });
    // EXPECTED BEHAVIOR

    expect(g2.toJSON()).toEqual({
      __v: 0,
      _id: expect.anything(),
      players: [{
        __v: 0,
        _id: expect.anything(),
        name: '1',
        sex: 'm',
        surname: '1'
      }, {
        __v: 0,
        _id: expect.anything(),
        name: '2',
        sex: 'f',
        surname: '2'
      }]
    });
  }));
});