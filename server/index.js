'use strict';

var path = require('path');
var express = require('express');
var expressHbs = require('express-handlebars');
var auth = require('http-auth');
var glob = require('glob');
var includes = require('lodash/includes');
var defaults = require('lodash/defaults');
var dropRight = require('lodash/dropRight');
var last = require('lodash/last');
var flatten = require('lodash/flatten');
var routes = require('./routes');
var helpers = require('./helpers');
var templateData = require('./lib/templateData');

var AUTH_USER = process.env.AUTH_USER;
var AUTH_PASSWORD = process.env.AUTH_PASSWORD;

var app = express();

if (
    includes(['production'], process.env.NODE_ENV) &&
    process.env.AUTH_USER &&
    process.env.AUTH_PASSWORD
) {
    let basicAuth = auth.basic({
        realm: 'Preview'
    }, function (username, password, callback) {
        callback(username === AUTH_USER && password === AUTH_PASSWORD);
    });

    app.use(auth.connect(basicAuth));
}

app.use(require('morgan')('dev'));
app.use(require('compression')());
app.use(require('errorhandler')());

module.exports = function (styleguideOptions, options) {
    const config = defaults(options, {
        ext: 'html',
        port: process.env.PORT || 4444,
        staticPaths: ['static', 'examples'],
        dataDir: 'data',
        componentsDir: 'components',
        viewsDir: 'views',
        layoutTmpl: 'layout',
        sections: [{
            type: 'list',
            title: 'Pages',
            path: '/pages',
            directory: 'pages',
            partials: false
        }, {
            type: 'collection',
            title: 'Patterns',
            path: '/patterns',
            directory: 'patterns',
            partials: true,
            showUsage: true,
            ordering: null
        }]
    });

    const viewsDir = path.resolve(process.cwd(), config.viewsDir);
    const clientDir = path.resolve(path.resolve(__dirname, '..'), 'client');
    const componentsDir = path.resolve(process.cwd(), config.componentsDir);

    const defaultPartialsDirs = [
        {namespace: 'baseplate', dir: path.resolve(clientDir, 'partials')},
        {namespace: 'partials', dir: path.resolve(viewsDir, 'partials')}
    ];

    const partialsDirs = config.sections
        .filter(item => item.partials === true)
        .map(function (item) {
            return {
                namespace: item.directory,
                dir: path.resolve(componentsDir, item.directory)
            };
        });

    const hbs = expressHbs.create({
        defaultLayout: config.layoutTmpl,
        layoutsDir: viewsDir,
        extname: `.${config.ext}`,
        partialsDir: defaultPartialsDirs.concat(partialsDirs),
        helpers: helpers
    });

    app.locals.config = config;
    app.locals.clientDir = clientDir;
    app.locals.styleguideOptions = styleguideOptions;

    app.locals.tmplData = (function () {
        let dataDir = path.resolve(process.cwd(), config.dataDir);
        let dataFiles = glob.sync(`${dataDir}/*.json`);
        return templateData(dataFiles);
    })();

    app.set('port', config.port);
    app.engine(config.ext, hbs.engine);
    app.set('view engine', config.ext);
    app.set('views', componentsDir);

    app.use('/baseplate', express.static(path.resolve(clientDir, 'static')));

    config.staticPaths.forEach(function (path) {
        app.use('/' + path, express.static(path));
    });

    return new Promise(function (resolve) {
        app.use('/', routes.styleguide);

        var promises = config.sections.map(section => {
            let tmpls = hbs.getTemplates(path.resolve(componentsDir, section.directory));
            return Promise.all([tmpls].concat([hbs.getPartials()])).then(function (results) {
                var resultItems = flatten(dropRight(results));
                var resultPartials = last(results);

                let route;
                if (section.type === 'collection') {
                    route = routes.generateCollection(
                        section,
                        path.resolve(componentsDir, section.directory),
                        resultItems[0],
                        resultPartials,
                        app.locals.tmplData,
                        clientDir
                    );
                } else {
                    route = routes.generateList(
                        section,
                        resultItems[0],
                        resultPartials,
                        app.locals.tmplData,
                        clientDir
                    );
                }

                app.use(section.path, route);
            });
        });

        return Promise.all(promises).then(function () {
            resolve({
                app: app,
                start: function () {
                    return app.listen(app.get('port'), function () {
                        console.info('Server started on port %s', app.get('port'));
                    });
                }
            });
        }).catch(err => console.error(err.stack));
    });
};
