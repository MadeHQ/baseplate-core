var fs = require('fs');
var path = require('path');
var memoize = require('lodash/memoize');

module.exports = memoize(function (src) {
    var filepath = path.resolve(path.dirname(require.main.filename), src);
    var file;
    try {
        file = fs.readFileSync(filepath, 'utf-8');
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }
    return file;
});
