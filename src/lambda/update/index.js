/**
 * Update or install the database.
 **/
'use strict';

var _ = require('lodash'),
    async = require('async'),
    dynamoose = require('dynamoose'),
    requireDir = require('require-dir');

/**
 * Create the needed table if it doesn't already exist
 **/
var createTable = function (model, done) {
  var table = new dynamoose.Table(model.tableName, model.tableSchema, {}, dynamoose);

  table.init().then(function () {
    table.waitForActive(done);
  }).catch(done);
};

exports.handler = function (event, context) {
  var models = requireDir(__dirname + '/lib/models');

  async.eachSeries(_.values(models), function (model, callback) {
    if (_.has(model, 'tableSchema')) {
      createTable(model, callback);
    } else {
      callback();
    }
  }, function (err){
    if (err) {
      context.fail(err);
      return;
    }
    context.succeed("OK");
  });
};
