'use strict';

var path = require('path');
var express = require('express');
var showdown = require('showdown');
var swatches = require('../lib/swatches');

module.exports = function (styleguide) {
    var router = new express.Router({
        mergeParams: true
    });

    var converter = new showdown.Converter();

    router.get('/', function (req, res) {
        var locals = req.app.locals;
        res.render(path.resolve(locals.clientDir, 'styleguide'), {
            title: styleguide.title,
            introduction: styleguide.introduction && converter.makeHtml(styleguide.introduction),
            colors: swatches(styleguide.colors),
            fontStacks: styleguide.fontStacks
        });
    });

    return router;
};
