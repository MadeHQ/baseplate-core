var fs = require('fs');
var path = require('path');
var memoize = require('lodash/memoize');

module.exports = memoize(function (src) {
    var filepath = path.resolve(process.cwd(), src);
    var file;
    try {
        file = fs.readFileSync(filepath, 'utf-8');
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }

    return file;
});
