var loremIpsum = require('lorem-ipsum').loremIpsum;

module.exports = function (count) {
    return loremIpsum({
        count: count,
        units: 'sentences',
        sentenceLowerBound: 20,
        sentenceUpperBound: 50
    });
};
