'use strict';

var path = require('path');
var glob = require('glob');
var getPort = require('get-port');
var auth = require('http-auth');
var express = require('express');
var expressHbs = require('express-handlebars');

var assign = require('lodash/assign');
var defaults = require('lodash/defaults');
var dropRight = require('lodash/dropRight');
var flatten = require('lodash/flatten');
var last = require('lodash/last');

var routes = require('./routes');
var helpers = require('./helpers');
var plugins = require('./lib/plugins');
var templateData = require('./lib/templateData');
var styleguideDefaults = require('./styleguide-defaults.json');

var app = express();

var APP_DIR = path.dirname(require.main.filename);

if (process.env.AUTH_USER && process.env.AUTH_PASSWORD) {
    app.use(auth.connect(auth.basic({
        realm: 'Preview'
    }, function (username, password, callback) {
        callback(
            username === process.env.AUTH_USER &&
            password === process.env.AUTH_PASSWORD
        );
    })));
}

app.use(require('morgan')('dev'));
app.use(require('compression')());
app.use(require('errorhandler')());

module.exports = function (options, helperPlugins) {
    const config = defaults(options.config, {
        ext: 'html',
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
            showSource: false,
            ordering: null
        }]
    });

    const viewsDir = path.resolve(APP_DIR, config.viewsDir);
    const clientDir = path.resolve(path.resolve(__dirname, '..'), 'client');
    const componentsDir = path.resolve(APP_DIR, config.componentsDir);

    const defaultPartialsDirs = [{
        namespace: 'baseplate',
        dir: path.resolve(clientDir, 'partials')
    }, {
        namespace: 'partials',
        dir: path.resolve(viewsDir, 'partials')
    }];

    const partialsDirs = config.sections
        .filter(item => item.partials === true)
        .map(function (item) {
            return {
                namespace: item.directory,
                dir: path.resolve(componentsDir, item.directory)
            };
        });

    plugins.register(
        helpers,
        helperPlugins
    );

    const hbs = expressHbs.create({
        defaultLayout: config.layoutTmpl,
        layoutsDir: viewsDir,
        extname: `.${config.ext}`,
        partialsDir: defaultPartialsDirs.concat(partialsDirs),
        helpers: plugins.getHelpers()
    });

    app.locals.config = config;
    app.locals.clientDir = clientDir;

    app.locals.tmplData = (function () {
        let dataDir = path.resolve(APP_DIR, config.dataDir);
        let dataFiles = glob.sync(`${dataDir}/*.json`);
        return templateData(dataFiles);
    })();

    app.engine(config.ext, hbs.engine);
    app.set('view engine', config.ext);
    app.set('views', componentsDir);

    app.use('/baseplate', express.static(path.resolve(clientDir, 'static'), {
        maxAge: '120s'
    }));

    config.staticPaths.forEach(function (staticPath) {
        app.use('/' + staticPath, express.static(path.resolve(APP_DIR, staticPath)));
    });

    /**
     * Documentation
     * @type {[type]}
     */
    var docFiles = glob.sync(`${path.resolve(APP_DIR, 'docs')}/*.md`);
    if (docFiles && docFiles.length > 0) {
        app.locals.hasDocs = true;
        app.use('/docs', routes.docs(docFiles));
    }

    return new Promise(function (resolve) {
        /**
         * Index route: Styleguide template
         */
        app.use('/', routes.styleguide(assign(
            {},
            styleguideDefaults,
            options.styleguide
        )));

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
                    var preferredPort = process.env.PORT || 5000;
                    getPort(preferredPort).then(port => {
                        app.listen(port, () => {
                            if (parseInt(port, 10) === parseInt(preferredPort, 10)) {
                                console.info(`Server started on port ${port}`);
                            } else {
                                console.info(`Prefrerred port ${preferredPort} unavailable using port ${port} instead`);
                            }

                            console.info(`Open up http://localhost:${port} to view the app`);
                        });
                    });
                }
            });
        }).catch(err => console.error(err.stack));
    });
};
