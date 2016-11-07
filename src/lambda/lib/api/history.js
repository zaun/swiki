'use strict';

var _ = require('lodash');
var async = require('async');

var History = require('../models/history.js');

var api = {};

/**
 * List all sections for a document
 **/
api.list = function (event, callback) {
  History.list(event.pathParameters.objId, function (err, docs) {
    if (err) {
      return callback(500, err);
    }
    callback(200, docs);
  });
};

/**
 * Read an existing sections
 **/
api.read = function (event, callback) {
  History.read({
    id: event.pathParameters.objId,
    revision: event.pathParameters.revId
  }, { consistent: true }, function (err, doc) {
    if (err) {
      return callback(500, err);
    }

    if (!doc) {
      return callback(404, '');
    }

    callback(200, doc);
  });
};

/**
 * Create a new section
 **/
api.create = function (event, callback) {
  var data = _.cloneDeep(event.bodyJson);
  var objId, revId;
  async.waterfall([
    function (nextStep) {
      data.id = event.pathParameters.objId;
      data.revision = event.pathParameters.revId
      try {
        History.create(data, nextStep);
      } catch (err) {
        // Document validation error
        nextStep({
          status: 400,
          message: JSON.stringify(err, null, 2)
        });
      }
    },
    function (result, nextStep) {
      api.read({
        pathParameters: {
          objId: event.pathParameters.objId,
          revId: event.pathParameters.revId
        }
      }, function (status, data) {
        if (status != 200) {
          return nextStep({
            status: status,
            message: data
          });
        }
        nextStep(null, data)
      });
    }
  ], function (err, result) {
    if (err) {
      return callback(err.status, err.message);
    }
    callback(201, result);
  });
};

/**
 * Update an existing section
 **/
api.update = function (event, callback) {
  callback(400, '');
};

module.exports = api;
