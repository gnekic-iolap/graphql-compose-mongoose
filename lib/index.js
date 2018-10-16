"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  composeWithMongoose: true,
  composeWithMongooseDiscriminators: true,
  GraphQLMongoID: true
};
Object.defineProperty(exports, "composeWithMongoose", {
  enumerable: true,
  get: function get() {
    return _composeWithMongoose.composeWithMongoose;
  }
});
Object.defineProperty(exports, "composeWithMongooseDiscriminators", {
  enumerable: true,
  get: function get() {
    return _composeWithMongooseDiscriminators.composeWithMongooseDiscriminators;
  }
});
Object.defineProperty(exports, "GraphQLMongoID", {
  enumerable: true,
  get: function get() {
    return _mongoid.default;
  }
});
exports.default = void 0;

var _composeWithMongoose = require("./composeWithMongoose");

var _composeWithMongooseDiscriminators = require("./composeWithMongooseDiscriminators");

var _mongoid = _interopRequireDefault(require("./types/mongoid"));

var _fieldsConverter = require("./fieldsConverter");

Object.keys(_fieldsConverter).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _fieldsConverter[key];
    }
  });
});

var _discriminators = require("./discriminators");

Object.keys(_discriminators).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _discriminators[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = _composeWithMongoose.composeWithMongoose;
exports.default = _default;