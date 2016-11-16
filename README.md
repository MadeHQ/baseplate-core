# baseplate-core

[![Circle CI](https://img.shields.io/circleci/project/github/MadeHQ/baseplate-core/master.svg)](https://circleci.com/gh/MadeHQ/baseplate-core/tree/master) [![npm](https://img.shields.io/npm/v/baseplate-core.svg)](https://www.npmjs.com/package/baseplate-core) [![Dependencies](https://david-dm.org/madehq/baseplate-core.svg)](https://david-dm.org/madehq/baseplate-core) [![Dev Dependencies](https://david-dm.org/madehq/baseplate-core/dev-status.svg)](https://david-dm.org/madehq/baseplate-core#info=devDependencies&view=table)

A tool for building prototypes and pattern libraries.

Inspired heavily by [component-styleguide](https://github.com/webpro/component-styleguide). This is still very specific to our use-case so you probably want to look at component-styleguide first.

## Details

### Templating

[Handlebars](http://handlebarsjs.com) is used as the template engine.

### Helpers

Handlebars is a logicless templating engine so you need helpers to do anything interesting in them. A set of helpers are provided in the templates to make prototyping as simple as possible.

| Helper | Description
|---|---|---|
|`{{envIs 'production'}}`  | Check the current environment |
|`{{envIsNot 'production'}}` | Reverse of `envIs` check |
|`{{capitalize 'production'}}` | Capitalize a string |
|`{{getOrElse maybeValue "Default" }}`| Get a value if it exists otherwise return a default |
|`{{#repeat count}}block{{/repeat}}`| Repeat a block `count` times |
|`{{#repeatRange min max}}block{{/repeatRange}}`| Repeat a block between `min` and `max` times |
|`{{couldBeTrue threshold}}`| Returns `true/false` based on `threshold`, e.g. `0.9` will return `true` 90% of the time. |
|`{{lorem count}}`| Lorem ipsum generator. Returns `count` sentences |
|`{{loremWords min max}}`| Lorem ipsum generator. Returns random words between `min` and `max` |
|`{{inlineFile 'path/to/file.ext'}}`| Returns the contents of a file |
|`{{#queryString 'param' matches='value' }}` | Block helper to check if a query string parameter matches a certain value |

### Common Variables

A handful of root level common variables are exposed for use in templates. They are only available in **listings** as they are mostly used to get the current URL. If you need this data in a partial then pass it in as an argument.

| Variable | Description
|---|---|---|
| `{{@root.link}}` | Relative link to the current page |
| `{{@root.absoluteLink}}` | Absolute link to the current page |
| `{{@root.queryString}}` | Raw query string object |

### Partials

Everything under `components/patterns` is automatically registered as a partial. For example `{{> objects/icon}}` will render `components/patterns/objects/icon.html`). This is powerful for making components comprised of other components.

### Usage notes

You can add markdown files in the `patterns/` directory and the contents will be displayed alongside the pattern. The file needs to be named the same as the pattern e.g., `patterns/base/text.md` alongside `patterns/base/text.html`.

### Stub data

All JSON files under `data/` are concatenated into one context for the templates. E.g. `users.json` containing `[]` and `profile.json` containing `{}` will result in the following data for the templates:

```
{
   "users": [],
   "profile": {}
}
```

Now, the `{{#users}}` collection can be iterated over in any template.

### Static assets

By default anything under `/static` will be exposed by the server under `/static` (this is configurable). This is just a static directory so you are responsible for loading them in your layout, but this means you have full control over how you manage your assets.

## Installation Steps

If you don't want to start with the example app, need to configure some custom options, or just want to start from scratch you should follow these steps:

### 1. Install baseplate-core

```
npm init
npm install MadeHQ/baseplate-core --save
```

### 2. Structure

Create a directory structure similar to this:

```
├── baseplate-config.json
├── components
│   ├── pages
│   │   └── example-page.html
│   └── patterns
│       ├── base
│       └── modules
├── data
├── server.js
├── static
│   ├── images
│   ├── javascripts
│   └── stylesheets
└── views
    └── layout.html
```

### 3. Components

There are two types of component directories: **listings** which are a simple list of items (used by default for pages) and **collections** which display items on a single page grouped by folder (used by default for patterns).

You can configure any custom sections you want in `baseplate-config.json`, by adding a `sections` config.

```
{
    "sections": [{
        "type": "list",
        "title": "Pages",
        "path": "/pages",
        "directory": "pages",
        "partials": false
    }, {
        "type": "collection",
        "title": "Patterns",
        "path": "/patterns",
        "directory": "patterns",
        "partials": true,
        "showUsage": true,
        "ordering": [
            "base",
            "objects",
            "modules",
            "collections"
        ]
    }, {
        "type": "collection",
        "title": "Widgets",
        "path": "/widgets",
        "directory": "widgets",
        "showUsage": true,
        "partials": true
    }]
}
```

Available options are as follows:

| Option | Description
|---|---|---|
|`type` | Type of view: either `list` or `collection` |
|`title` | Navigation title, shown in toolbar |
|`path` | URL path |
|`directory` | Directory, relative to `components/` |
|`partials` | Should these items be available as partials?. If so they will be namespaced under the directory name, e.g. `{{> patterns/a/b }}` |
|`showUsage` | If enabled and there is a `.md` file with the same name as the file (e.g., `example.html` and `example.md` then usage notes will be shown alongside the item. Only available for **`collection`** type. |
|`ordering ` | By default collections will be ordered by directory name, if you want to customise the order, or exclude a directory from listings (but still have it available as partials) then a custom ordering will let you do this. Only available for **`collection`** type. |


### 4. Layout

In order to display anything you need to add a `layout.html` file under `views/`.

Three snippets are required: `{{> baseplate/styles}}` which returns a link to the pattern library styles and `{{> baseplate/scripts}}` which returns a link to the pattern library styles and `{{{body}}}` which renders the current view. Otherwise you are free to provide any html you like.

For example:

```
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>My Project</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    {{> baseplate/styles}}
    <link rel="stylesheet" href="/static/stylesheets/my-styles.css"/>
</head>
<body>
    {{{body}}}
    {{> baseplate/scripts}}
    <script src="/static/javascripts/my-app.js" async></script>
</body>
</html>
```

**Custom partials**: You can provide custom partials under `views/partials` which are then available in your layout as `{{> partials/nameOfPartial }}`. This is mostly useful if you want to break your layout template into smaller parts.

### 5. Start

Add a `server.js` using the following template.

```
var baseplate = require('baseplate-core');
var styleguide = require('./baseplate-styleguide.json');
var config = require('./baseplate-config.json');

baseplate(styleguide, config).then(function (server) {
    server.start();
});
```

Run it with `node server.js`

## API

```
baseplate(styleguide<Object>, [config<Object>]) // returns <Promise>
```

```
baseplate(styleguide).then(function (server) {
	/**
	 * server.app contains the Express app used internally
	 * Helpful if you want to add your own routes or modify the server
	 */
	server.app.get('/my-custom-route', function(req, res){
	  res.send('hello world');
	});

	/**
	 * Start the server
	 */
	 server.start();
});
```

## License

MIT
