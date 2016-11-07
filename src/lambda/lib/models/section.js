/**
 * Model: section
 * Represents a single section of a document
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
  'documentId': {
    type: String,
    hashKey: true
  },

  'id': {
    type: String,
    rangeKey: true,
    default: uuid.v4
  },

  'revision': {
    type: Number,
    default: timestamp
  },

  'title': {
    type: String,
    trim: true,
    required: true
  },

  'type': {
    type: String,
    required: true,
    trim: true
  },

  'dataString': {
    type: String
  },

  'dataObject': {
    type: Object
  },

  'dataArray': {
    type: Array
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

var tableName = 'Section';
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
 * Override the put method.
 **/
var oldUpdate = model.update;
model.update = function (keys, obj, options, callback) {
  obj.revision = timestamp(); // Force revision update
  delete obj.created // don't let the created time update
  oldUpdate.call(model, keys, obj, options, callback);
};

/**
 * Return a list instances of this model.
 **/
model.list = function (docId, callback) {
  model.query('documentId').eq(docId).exec(function (err, docs) {
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

  ret._href = '/document/' + ret.documentId + '/section/' + ret.id;

  return ret;
};

module.exports = model;
