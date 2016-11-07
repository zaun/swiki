'use strict';

var _ = require('lodash');

/**
 * Convert common model values to their bus JSON counterparts.
 **/
exports.convertToJson = function (obj) {
  var ret = _.cloneDeep(obj);
  delete ret.deleted;

  return ret;
};
