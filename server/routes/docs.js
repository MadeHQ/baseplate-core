'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var showdown = require('showdown');
var slugify = require('url-slug');
var find = require('lodash/find');
var reject = require('lodash/reject');

module.exports = function (docFiles) {
    var router = new express.Router({
        mergeParams: true
    });

    var converter = new showdown.Converter();

    var docsHtml = docFiles.map(function(docFile) {
        // Strip digits from start of label (i.e. 1.)
        var label = path.basename(docFile, path.extname(docFile)).replace(/^\d*\.\s/, '');
        return {
            id: slugify(label).toLowerCase(),
            label: label,
            content: converter.makeHtml(fs.readFileSync(docFile, 'utf-8'))
        };
    });

    var docsList = reject(docsHtml, x => x.id === 'index');

    function markActiveDoc(docsList, currentId) {
        return docsList.map(function(doc) {
            doc.isActive = doc.id === currentId;
            return doc;
        });
    }

    router.get('/', function (req, res) {
        var match = find(docsHtml, x => x.id === 'index');
        if (match) {
            res.render(path.resolve(req.app.locals.clientDir, 'docsEntry'), {
                isIndex: true,
                docs: markActiveDoc(docsList, 'index'),
                currentDoc: match
            });
        } else {
            res.sendStatus(404);
        }
    });

    router.get('/:id', function (req, res) {
        var candidates = reject(docsHtml, x => x.id === 'index');
        var match = find(candidates, x => x.id === req.params.id);
        if (match) {
            res.render(path.resolve(req.app.locals.clientDir, 'docsEntry'), {
                isIndex: false,
                docs: markActiveDoc(docsList, req.params.id),
                currentDoc: match
            });
        } else {
            res.sendStatus(404);
        }
    });

    return router;
};
