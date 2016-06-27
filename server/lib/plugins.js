var _ = require('lodash');

var combinedHelpers;

function register(coreHelpers, pluginHelpers) {
    function mergeObjects(xs) {
        // Custom merge function ORs together non-object values, recursively
        // calls itself on Objects.
        var merger = function (a, b) {
            var result;
            if (_.isObject(a)) {
                result = _.merge({}, a, b, merger);
            } else {
                result = a || b;
            }
            return result;
        };
        var args = _.flatten([{}, xs, merger]);
        return _.merge.apply(_, args);
    }

    combinedHelpers = mergeObjects([].concat(
        [coreHelpers],
        pluginHelpers || []
    ));
}

function getHelpers() {
    return combinedHelpers;
}

module.exports = {
    register: register,
    getHelpers: getHelpers
};
