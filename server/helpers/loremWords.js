var random = require('lodash/random');
var capitalize = require('lodash/capitalize');
var loremIpsum = require('lorem-ipsum').loremIpsum;

module.exports = function (min, max) {
    return capitalize(loremIpsum({
        count: random(min, max),
        units: 'words'
    }));
};
