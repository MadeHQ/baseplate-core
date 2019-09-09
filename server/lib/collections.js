'use strict';

var fs = require('fs');
var path = require('path');
var assign = require('lodash/assign');
var capitalize = require('lodash/capitalize');
var get = require('lodash/get');
var groupBy = require('lodash/groupBy');
var map = require('lodash/map');
var sample = require('lodash/sample');
var usageNotes = require('./usageNotes');

const labelFromSlug = slug => capitalize(slug.replace(/-/g, ' '));

const customOrdering = (ordering, items) => {
    let o = {};
    ordering.forEach(function (k) {
        o[k] = items[k];
    });
    return o;
};

const getUsage = (dir, filename) => {
    let filepath = path.resolve(dir, filename.replace(path.extname(filename), '.md'));
    return usageNotes(filepath, true);
};

const getRawTemplate = (dir, filename) => {
    var rawTemplate;
    try {
        rawTemplate = fs.readFileSync(path.resolve(dir, filename), 'utf-8');
    } catch (error) { }

    return rawTemplate;
};

/**
 * Try to find a json file for a pattern (e.g card.json)
 * Format: { defaults: [{}]}
 * Then pick a random item from the defaults choices.
 * Allows default mock data for a pattern, but with randomness
 */
const getDefaultPatternData = (dir, filename) => {
    var data;
    try {
        var filepath = path.resolve(dir, filename.replace(path.extname(filename), '.json'));
        var jsonData = fs.readFileSync(filepath, 'utf-8');
        jsonData = JSON.parse(jsonData);

        var dataCandidates = get(jsonData, 'defaults');
        data = sample(dataCandidates);
    } catch (error) { }

    return data;
};

const pages = (templates, options) => {
    options = options || {};
    return map(templates, (value, key) => {
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

const patterns = (templates, options) => {
    options = options || {};
    var items = map(templates, (value, key) => {
        var id = path.basename(key, path.extname(key));

        var templateData = assign(
            {},
            options.data,
            getDefaultPatternData(options.directory, key) || {}
        );

        var usage = false;
        if (options.usage) {
            usage = getUsage(options.directory, key);
        }

        var rawTemplate = false;
        if (options.showSource) {
            rawTemplate = getRawTemplate(options.directory, key);
        }

        return {
            id: id,
            label: labelFromSlug(id),
            group: key.split(path.sep)[0],
            usage: usage,
            rawTemplate: rawTemplate,
            content: value(templateData, {
                partials: options.partials || {},
                helpers: options.helpers || {}
            })
        };
    });

    var groupedItems = groupBy(items, data => data.group);

    if (options.ordering) {
        return customOrdering(options.ordering, groupedItems);
    }

    return groupedItems;
};

module.exports = {
    pages: pages,
    patterns: patterns,
    _: {
        labelFromSlug: labelFromSlug
    }
};
