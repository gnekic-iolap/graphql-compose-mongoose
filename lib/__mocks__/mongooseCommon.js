"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "mongoose", {
  enumerable: true,
  get: function get() {
    return _mongoose.default;
  }
});
exports.Types = exports.Schema = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _mongodbMemoryServer = _interopRequireDefault(require("mongodb-memory-server"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const Schema = _mongoose.default.Schema,
      Types = _mongoose.default.Types;
exports.Types = Types;
exports.Schema = Schema;
_mongoose.default.Promise = Promise;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
const originalConnect = _mongoose.default.connect;
_mongoose.default.connect =
/*#__PURE__*/
_asyncToGenerator(function* () {
  const mongoServer = new _mongodbMemoryServer.default();
  const mongoUri = yield mongoServer.getConnectionString(true); // originalConnect.bind(mongoose)(mongoUri, { useMongoClient: true }); // mongoose 4

  originalConnect.bind(_mongoose.default)(mongoUri, {
    useNewUrlParser: true
  }); // mongoose 5

  _mongoose.default.connection.on('error', e => {
    if (e.message.code === 'ETIMEDOUT') {
      console.error(e);
    } else {
      throw e;
    }
  });

  _mongoose.default.connection.once('open', () => {// console.log(`MongoDB successfully connected to ${mongoUri}`);
  });

  _mongoose.default.connection.once('disconnected', () => {
    // console.log('MongoDB disconnected!');
    mongoServer.stop();
  });
});