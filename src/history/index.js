/**
 * View history items.
 **/
'use strict';

var _ = require('lodash');
var async = require('async');

var history = require('./lib/api/history.js');

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

  var resource = event.resource.toUpperCase();
  var method = event.httpMethod.toUpperCase();

  switch(resource) {
    case '/HISTORY/{OBJID}':
      switch(method) {
        case 'GET':
          history.list(event, done);
          break;

        default:
          done(405, errorMessages.badMethod + ': ' + method);
      };
      break;

    case '/HISTORY/{OBJID}/REVISION/{REVID}':
      switch(method) {
        case 'GET':
          history.read(event, done);
          break;

        default:
          done(405, errorMessages.badMethod + ': ' + method);
      };
      break;

    default:
      done(400, errorMessages.badResource + ': ' + resource);
  };
};
