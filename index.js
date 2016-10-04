'use strict';

exports.handler = function (event, context) {

  context.succeed({
    'test': true
  });
};
