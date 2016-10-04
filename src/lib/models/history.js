/**
 * Model: attribute
 * Represents a single key/value attribute
 **/

'use strict';

var _ = require('lodash');

var dynamoose = require('dynamoose'),
    util = require('../util');

function timestamp() {
  return new Date().getTime();
}

var schema = new dynamoose.Schema({
  'id': {
    type: String,
    hashKey: true
  },

  'revision': {
    type: Number,
    rangeKey: true
  },

  'object': {
    type: Object,
    required: true
  },

  'created': {
    type: Date,
    default: timestamp
  }
}, {
  throughput: { read: 1, write: 1 }
});

var tableName = 'History';
var model = dynamoose.model(tableName, schema, { create: false });
model.tableSchema = schema;
model.tableName = tableName;

/**
 * Return a list instances of this model.
 **/
model.list = function (id, callback) {
  model.query('id').eq(id).exec(function (err, docs) {
    if (docs) {
      docs = _.map(docs, function (doc) {
        return doc.toJson();
      })
    }
    callback(err, docs);
  });
};

/**
 * Retrieve a single instance of this model.
 **/
model.read = function (keys, options, callback) {
  model.get(keys, options, function (err, doc) {
    if (doc) {
      doc = doc.toJson();
    }
    callback(err, doc);
  });
};


/**
 * Translate this model into JSON.
 **/
model.prototype.toJson = function () {
  var ret = util.convertToJson(this);

  ret._href = '/history/' + ret.id + '/revision/' + ret.revision;

  return ret;
};

module.exports = model;
