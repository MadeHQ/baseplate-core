var get = require('lodash/get');

module.exports = function (key, options) {
    var queryString = get(options.data, `root.queryString.${key}`);
    var result;
    if (queryString === options.hash.matches) {
        result = options.fn(this);
    } else {
        result = options.inverse(this);
    }

    return result;
};
