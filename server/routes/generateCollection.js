'use strict';

var path = require('path');
var express = require('express');
var find = require('lodash/find');

var collections = require('../lib/collections');
var helpers = require('../helpers');

/* eslint-disable max-params */
module.exports = function (sectionConfig, directory, items, partials, data, clientDir) {
    var router = new express.Router({
        mergeParams: true
    });

    function getCollections() {
        return collections.patterns(items, {
            directory: directory,
            partials: partials,
            ordering: sectionConfig.ordering,
            usage: sectionConfig.showUsage,
            helpers: helpers,
            data: data
        });
    }

    router.get('/', function (req, res) {
        res.render(path.resolve(clientDir, 'collection'), {
            basePath: sectionConfig.path,
            groups: getCollections()
        });
    });

    router.get('/:group', function (req, res) {
        let group = {};
        let collections = getCollections();
        group[req.params.group] = find(collections, (_, key) => key === req.params.group);
        res.render(path.resolve(clientDir, 'collection'), {
            basePath: sectionConfig.path,
            groups: group
        });
    });

    router.get('/:group/:id?', function (req, res) {
        let collections = getCollections();
        let group = find(collections, (_, key) => key === req.params.group);
        let result = find(group, x => x.id === req.params.id);
        if (result) {
            res.render(path.resolve(clientDir, 'standalone'), result);
        } else {
            res.sendStatus(404);
        }
    });

    return router;
};
