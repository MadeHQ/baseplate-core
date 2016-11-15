'use strict';

var path = require('path');
var keyBy = require('lodash/keyBy');
var mapValues = require('lodash/mapValues');

module.exports = function (files) {
    var keyedFiles = keyBy(files, file => path.basename(file, path.extname(file)));
    return mapValues(keyedFiles, file => require(file)); // eslint-disable-line import/no-dynamic-require
};
