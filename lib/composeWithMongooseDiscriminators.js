"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeWithMongooseDiscriminators = composeWithMongooseDiscriminators;

var _discriminators = require("./discriminators");

function composeWithMongooseDiscriminators(baseModel, opts) {
  return _discriminators.DiscriminatorTypeComposer.createFromModel(baseModel, opts);
}