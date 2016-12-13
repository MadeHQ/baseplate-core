'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var usageNotes = require('./usageNotes');

const labelFromSlug = slug => _.capitalize(slug.replace(/-/g, ' '));

const customOrdering = (ordering, items) => {
    let o = {};
    ordering.forEach(function (k) {
        o[k] = items[k];
    });
    return o;
};

const pages = (templates, options) => {
    options = options || {};
    return _.map(templates, (value, key) => {
        let id = path.basename(key, path.extname(key));
        return {
            id: id,
            label: labelFromSlug(id),
            content: value(options.data || {}, {
                partials: options.partials || {},
                helpers: options.helpers || {}
            })
        };
    });
};

const getUsage = (dir, filename) => {
    let filepath = path.resolve(dir, filename.replace(path.extname(filename), '.md'));
    return usageNotes(filepath, true);
};

const getRawTemplate = (dir, filename) => {
    var rawTemplate;
    try {
        rawTemplate = fs.readFileSync(path.resolve(dir, filename), 'utf-8');
    } catch (err) { }
    console.log(rawTemplate);
    return rawTemplate;
};

const getPatterns = (templates, options) => {
    return _.chain(templates).map((value, key) => {
        let id = path.basename(key, path.extname(key));
        return {
            id: id,
            label: labelFromSlug(id),
            group: key.split(path.sep)[0],
            usage: (options.usage) ? getUsage(options.directory, key) : false,
            rawTemplate: (options.showSource) ? getRawTemplate(options.directory, key) : false,
            content: value(options.data || {}, {
                partials: options.partials || {},
                helpers: options.helpers || {}
            })
        };
    }).groupBy(data => data.group).value();
};

const patterns = (templates, options) => {
    options = options || {};
    var items = getPatterns(templates, options);
    return (options.ordering) ? customOrdering(options.ordering, items) : items;
};

module.exports = {
    pages: pages,
    patterns: patterns,
    _: {
        labelFromSlug: labelFromSlug
    }
};
