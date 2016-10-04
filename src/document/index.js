'use strict';

var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var hasAnyDeep = require('has-any-deep');

var JaySchema = require('jayschema');
var js = new JaySchema();

var attribute = require('./lib/api/attribute.js');
var document = require('./lib/api/document.js');
var section = require('./lib/api/section.js');

var errorMessages = {
    badMethod: 'Method Not Allowed',
    badResource: 'Bad Request'
};


exports.handler = function (event, context) {

  var done = function (status, body) {
    context.succeed({
      statusCode: status,
      headers: {},
      body: _.isObject(body) ? JSON.stringify(body, null, 2) : body
    });
  };

  try {
    event.bodyJson = JSON.parse(event.body);
  } catch (e) {
    event.bodyJson = {};
  }

  if (!event.resource || !event.httpMethod) {
    return done(500, JSON.stringify(event, null, 2));
  }

  // Load schemas
  var documentSchema = require('./lib/schemas/document.json');
  var attributeSchema = require('./lib/schemas/attribute.json');
  var sectionSchema = require('./lib/schemas/section.json');

  // Load in references
  js.register(require('./lib/schemas/attribute.json'), 'attribute.json');
  js.register(require('./lib/schemas/section.json'), 'section.json');
  var files = fs.readdirSync('./lib/schemas/attributes/');
  _.forEach(files, function (file) {
    js.register(require('./lib/schemas/attributes/' + file), file);
  });
  files = fs.readdirSync('./lib/schemas/sections/');
  _.forEach(files, function (file) {
    js.register(require('./lib/schemas/sections/' + file), file);
  });

  // Check for missing references
  var missing = js.getMissingSchemas();
  if (missing.length) {
    return done(500, JSON.stringify(missing, null, 2));
  }

  var resource = event.resource.toUpperCase();
  var method = event.httpMethod.toUpperCase();

  switch(resource) {
    case '/DOCUMENT':
      switch(method) {
        case 'GET':
          document.list(event, done);
          break;

        case 'POST':
          // JSON validation
          var errors = js.validate(event.bodyJson, documentSchema);
          if (errors.length) {
            return done(400, errors);
          }

          // Check that no id, revision or _href properties exist
          // if (hasAnyDeep(event.bodyJson, ['id', 'revision', '_href'])) {
          //   return done(400, 'Document object can not contain "id", "revision" or "_href" keys when creating.');
          // }

          document.create(event, done);
          break;

        default:
          done(405, errorMessages.badMethod + ': ' + method);
      };
      break;

    case '/DOCUMENT/{DOCID}':
      switch(method) {
        case 'GET':
          document.read(event, done);
          break;

        default:
          done(405, errorMessages.badMethod + ': ' + method);
      };
      break;

    case '/DOCUMENT/{DOCID}/ATTRIBUTE':
      switch(method) {
        case 'GET':
          attribute.list(event, done);
          break;

        case 'POST':
          // JSON validation
          var errors = js.validate(event.bodyJson, attributeSchema);
          if (errors.length) {
            return done(400, errors);
          }

          // Check that no id, revision or _href properties exist
          // if (hasAnyDeep(event.bodyJson, ['documentId', 'id', 'revision', '_href'])) {
          //   return done(400, 'Attribute object can not contain "documentId", "id", "revision" or "_href" keys when creating.');
          // }

          attribute.create(event, done);
          break;

        default:
          done(405, errorMessages.badMethod + ': ' + method);
      };
      break;

    case '/DOCUMENT/{DOCID}/ATTRIBUTE/{ATTRID}':
      switch(method) {
        case 'GET':
          attribute.read(event, done);
          break;

        case 'PUT':
          // JSON validation
          var errors = js.validate(event.bodyJson, attributeSchema);
          if (errors.length) {
            return done(400, errors);
          }

          // Check that  id, revision and _href properties exist

          // Check that no created propertie exist
          // if (hasAnyDeep(event.bodyJson, ['created'])) {
          //   return done(400, 'Attribute object can not contain "created" keys when updating.');
          // }

          attribute.update(event, done);
          break;

        default:
          done(405, errorMessages.badMethod + ': ' + method);
      };
      break;

    case '/DOCUMENT/{DOCID}/SECTION':
      switch(method) {
        case 'GET':
          section.list(event, done);
          break;

        case 'POST':
          // JSON validation
          var errors = js.validate(event.bodyJson, sectionSchema);
          if (errors.length) {
            return done(400, errors);
          }

          // Check that no id, revision or _href properties exist
          // if (hasAnyDeep(event.bodyJson, ['documentId', 'id', 'revision', '_href'])) {
          //   return done(400, 'Section object can not contain "documentId", "id", "revision" or "_href" keys when creating.');
          // }

          section.create(event, done);
          break;

        default:
          done(405, errorMessages.badMethod + ': ' + method);
      };
      break;

    case '/DOCUMENT/{DOCID}/SECTION/{SECID}':
      switch(method) {
        case 'GET':
          section.read(event, done);
          break;

        case 'PUT':
          // JSON validation
          var errors = js.validate(event.bodyJson, sectionSchema);
          if (errors.length) {
            return done(400, errors);
          }

          // Check that  id, revision and _href properties exist

          section.update(event, done);
          break;

        default:
          done(405, errorMessages.badMethod + ': ' + method);
      };
      break;

    default:
      done(400, errorMessages.badResource + ': ' + resource);
  };
};
