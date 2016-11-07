'use strict';

var _ = require('lodash');
var async = require('async');

var Attribute = require('../models/attribute.js');
var Document = require('../models/document.js');
var History = require('../models/history.js');
var Section = require('../models/section.js');

var api = {};

/**
 * List all documents
 **/
api.list = function (event, callback) {
  Document.list(function (err, docs) {
    if (err) {
      return callback(500, err);
    }
    callback(200, docs);
  });
};

/**
 * Read an existing document
 **/
api.read = function (event, callback) {
  Document.read({id: event.pathParameters.docId }, { consistent: true }, function (err, doc) {
    if (err) {
      return callback(500, err);
    }

    if (!doc) {
      return callback(404, '');
    }

    Attribute.list(doc.id, function(err, attrs) {
      if (err) {
        return callback(500, err);
      }

      if (!attrs) {
        attrs = [];
      }

      doc.attributes = attrs;

      Section.list(doc.id, function(err, secs) {
        if (err) {
          return callback(500, err);
        }

        if (!secs) {
          secs = [];
        }

        doc.sections = secs;
        callback(200, doc);
      });
    });
  });
};

/**
 * Create a new document
 **/
api.create = function (event, callback) {
  var data = _.cloneDeep(event.bodyJson);
  var docId;
  async.waterfall([
    function (nextStep) {
      try {
        Document.create(data, nextStep);
      } catch (err) {
        // Document validation error
        nextStep({
          status: 400,
          message: JSON.stringify(err, null, 2)
        });
      }
    },
    function (result, nextStep) {
      docId = result.id;
      async.eachLimit(data.attributes, 2, function (item, nextItem) {
        item.documentId = docId;
        Attribute.create(item, nextItem);
      }, nextStep)
    },
    function (nextStep) {
      async.eachLimit(data.sections, 2, function (item, nextItem) {
        item.documentId = docId;
        Section.create(item, nextItem);
      }, nextStep)
    },
    function (nextStep) {
      api.read({
        pathParameters: {
          docId: docId
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
 * Update an existing document
 **/
api.update = function (event, callback) {
  callback(500, '');
};

module.exports = api;
