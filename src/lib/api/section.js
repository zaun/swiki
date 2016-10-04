'use strict';

var _ = require('lodash');
var async = require('async');

var History = require('../models/history.js');
var Section = require('../models/section.js');

var api = {};

/**
 * List all sections for a document
 **/
api.list = function (event, callback) {
  Section.list(event.pathParameters.docId, function (err, docs) {
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
  Section.read({
    documentId: event.pathParameters.docId,
    id: event.pathParameters.secId
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
  var docId, secId;
  async.waterfall([
    function (nextStep) {
      data.documentId = docId;
      try {
        Section.create(data, nextStep);
      } catch (err) {
        // Document validation error
        nextStep({
          status: 400,
          message: JSON.stringify(err, null, 2)
        });
      }
    },
    function (result, nextStep) {
      secId = result.id;
      api.read({
        pathParameters: {
          docId: docId,
          secId: secId
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
  var data = _.cloneDeep(event.bodyJson);
  var docId = data.documentId;
  var secId = data.id;
  var rev = data.revision;
  delete data.documentId;
  delete data.id;
  delete data.revision;

  var current;

  async.waterfall([
    function (nextStep) {
      api.read({
        pathParameters: {
          docId: docId,
          secId: secId
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
    },
    function (currentData, nextStep) {
      current = currentData;
      delete current._href;
      
      try {
        Section.update({
          documentId: docId,
          id: secId
        }, data, {
          condition: '#o = :revision',
          conditionNames: { o: 'revision' },
          conditionValues: { revision: rev }
        }, function (err) {
          if (err) {
            return nextStep({
              status: 400,
              message: JSON.stringify(err, null, 2)
            });
          }
          nextStep();
        });
      } catch (err) {
        // Attribute validation error
        nextStep({
          status: 400,
          message: JSON.stringify(err, null, 2)
        });
      }
    },
    function (nextStep) {
      History.create({
        id: current.id,
        revision: current.revision,
        object: current
      }, nextStep);
    },
    function (result, nextStep) {
      api.read({
        pathParameters: {
          docId: docId,
          secId: secId
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
    callback(202, result);
  });
};

module.exports = api;
