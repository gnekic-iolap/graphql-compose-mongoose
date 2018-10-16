"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findById;

var _helpers = require("./helpers");

function findById(model, tc, opts // eslint-disable-line no-unused-vars
) {
  if (!model || !model.modelName || !model.schema) {
    throw new Error('First arg for Resolver findById() should be instance of Mongoose Model.');
  }

  if (!tc || tc.constructor.name !== 'TypeComposer') {
    throw new Error('Second arg for Resolver findById() should be instance of TypeComposer.');
  }

  return new tc.constructor.schemaComposer.Resolver({
    type: tc.getType(),
    name: 'findById',
    kind: 'query',
    args: {
      _id: 'MongoID!'
    },
    resolve: resolveParams => {
      const args = resolveParams.args || {};

      if (args._id) {
        resolveParams.query = model.findById(args._id); // eslint-disable-line

        (0, _helpers.projectionHelper)(resolveParams);
        return resolveParams.query.exec();
      }

      return Promise.resolve(null);
    }
  });
}