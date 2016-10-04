/**
 * Model: document
 * Represents metadata for a document
 **/

'use strict';

var _ = require('lodash');

var dynamoose = require('dynamoose'),
    uuid = require('uuid'),
    util = require('../util');

function timestamp() {
  return new Date().getTime();
}

var schema = new dynamoose.Schema({
  'id': {
    type: String,
    hashKey: true,
    default: uuid.v4
  },

  'revision': {
    type: Number,
    default: timestamp
  },

  'title': {
    type: String,
    required: true,
    index: {
      global: true,
      name: 'TitleIndex',
      project: true,
      throughput: 1
    }
  },

  'abstract': {
    type: String,
    required: true,
    default: ''
  },

  'tags': {
    type: Array,
    required: true,
    default: []
  },

  'deleted': {
    type: Boolean,
    default: false
  },

  'created': {
    type: Date,
    default: timestamp
  }
}, {
  throughput: { read: 1, write: 1 }
});

var tableName = 'Document';
var model = dynamoose.model(tableName, schema, { create: false });
model.tableSchema = schema;
model.tableName = tableName;

/**
 * Override the create method to set the type.
 **/
var oldCreate = model.create;
model.create = function (obj, options, callback) {
  delete obj.id; // Force a uuid for creates
  oldCreate.call(model, obj, options, callback);
};

/**
 * Return a list instances of this model.
 **/
model.list = function (callback) {
  model.scan().where('deleted').eq(false).exec(function (err, docs) {
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

  ret._href = '/document/' + ret.id;

  return ret;
};

module.exports = model;
